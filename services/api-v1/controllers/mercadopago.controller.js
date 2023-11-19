'use strict'

let fileController = require('./file.controller');
let mp = require("mercadopago");
let moment = require('moment');
moment.locale('es');

let PaymentMethod;
let MovementOfCash;
let Transaction;

let databases = [
	'distribuidoragiletta',
	'pizzaya',
	'barbero',
	'syf',
    'quierosersanto',
    'fronteraonline'
];

async function generatePaymentLink(req, res, next) {

	initConnectionDB(req.session.database);

	let mercadopagoAPIKey = '';
	await getPaymentMethodMercadopago().then(paymentMethod => {
		mercadopagoAPIKey = paymentMethod.mercadopagoAPIKey;
	}).catch(
		error => {
			mercadopagoAPIKey = null;
		}
	);
	if (mercadopagoAPIKey) {
		mp.configurations.setAccessToken(mercadopagoAPIKey);
		req.body['collector_id'] = parseInt(mercadopagoAPIKey.split('-')[mercadopagoAPIKey.split('-').length - 1]);
		mp.createPreference(req.body)
			.then((preference) => {
				fileController.writeLog(req, res, next, 200, { paymentLink: preference.response.init_point });
				return res.status(200).send({ paymentLink: preference.response.init_point });
			}).catch(error => {
				fileController.writeLog(req, res, next, 200, error);
				return res.status(200).send({ message: error.message });
			});
	} else {
		fileController.writeLog(req, res, next, 500, 'No tiene configurado la mercadopago APIKey');
		return res.status(200).send({ message: 'No tiene configurado la mercadopago APIKey' });
	}
}

async function verifyPaymentsByClient(req, res, next) {
	let result = await verifyPayments(req.session.database);
	return res.status(200).send('ok');
}

async function verifyPayments(db = null) {
	return new Promise(async (resolve, reject) => {
		for (let database of databases) {
			if (db == null || database == db) {
				initConnectionDB(database);
				await getTransactions({ state: "Pendiente de pago", operationType: { $ne: "D" } })
					.then(async transactions => {
						if (transactions && transactions.length > 0) {
							for (let transaction of transactions) {
								await searchPayment(transaction._id.toString())
									.then(async result => {
										if (result && result.body.results && result.body.results.length > 0) {
											let payConfirmed;
											for (let pay of result.body.results) {
												payConfirmed = pay;
											}
											if (payConfirmed) {
												let movementOfCash = new MovementOfCash();
												let op;
												await getMovementsOfCashes()
													.then(result => {
														if (result && result.length > 0) {
															op = 'update';
															movementOfCash = result[0];
														} else {
															op = 'save';
														}
													})
													.catch(error => {
													});

												movementOfCash.date = payConfirmed.date_last_updated;
												movementOfCash.expirationDate = payConfirmed.date_of_expiration;
												if (payConfirmed.status === 'approved') {
													movementOfCash.amountPaid = payConfirmed.transaction_amount;
												} else {
													movementOfCash.amountPaid = 0;
												}
												movementOfCash.observation = `Método ${payConfirmed.payment_method_id}. Monto ${payConfirmed.transaction_amount}. Estado ${payConfirmed.status}. Última actualización ${moment(payConfirmed.date_last_updated).format('DD/MM/YYYY hh:mm:ss')}.`;
												let paymentMethod;
												await getPaymentMethodMercadopago().then(
													async result => {
														paymentMethod = result;
														movementOfCash.type = paymentMethod._id;
														movementOfCash.transaction = transaction._id;
														movementOfCash.number = payConfirmed.id;
														movementOfCash.creationDate = payConfirmed.date_created;
														movementOfCash.updateDate = payConfirmed.date_last_updated;
														movementOfCash.operationType = 'U';

														if (op == 'save') {
															await saveMovementOfCash(movementOfCash);
														} else {
															await updateMovementOfCash(movementOfCash);
														}
													})
													.catch(error => {

													});
											}
											if (payConfirmed.status === 'approved') {
												transaction.state = 'Pago Confirmado';
												transaction.balance = 0;
												await updateTransaction(transaction);
											} else if (payConfirmed.status === 'rejected') {
												transaction.state = 'Pago Rechazado';
												await updateTransaction(transaction);
											}
										}
									})
									.catch(error => {
										reject(error);
									});
							}
						}
					})
					.catch(error => {
						reject(error);
					});
			}
		}
		resolve(true);
	});
}

async function saveMovementOfCash(movementOfCash) {
	return new Promise(async (resolve, reject) => {
		movementOfCash.save(async (err, movementOfCashSaved) => {
			if (err) {
				reject(err);
			} else {
				resolve(movementOfCashSaved);
			}
		});
	});
}

async function updateMovementOfCash(movementOfCash) {
	return new Promise(async (resolve, reject) => {
		MovementOfCash.findByIdAndUpdate(movementOfCash._id, movementOfCash, (err, movementOfCashUpdate) => {
			if (err) {
				reject(err);
			} else {
				resolve(movementOfCashUpdate);
			}
		});
	});
}

async function getMovementsOfCashes(where) {
	return new Promise(async (resolve, reject) => {
		MovementOfCash.find(where).exec((err, movementsOfCashes) => {
			if (err) {
				reject(err);
			} else {
				resolve(movementsOfCashes);
			}
		});
	});
}

async function updateTransaction(transaction) {
	return new Promise((resolve, reject) => {
		Transaction.findByIdAndUpdate(transaction._id, transaction, { new: true }, async (err, transactionUpdated) => {
			if (err) {
				reject(err);
			} else {
				resolve(transactionUpdated);
			}
		});
	});
}

function startPaymentVerificationTask() {
	let CronJob = require('cron').CronJob;

	let job = new CronJob('0 0 0 * * *', function () {
		verifyPayments();
	}, null, true);
	job.start();
}

function getTransactions(where) {
	return new Promise((resolve, reject) => {
		Transaction.find(where)
			.exec((err, transactions) => {
				if (err) {
					reject(err);
				} else {
					resolve(transactions);
				}
			});
	});
}

function getPaymentMethodMercadopago() {
	return new Promise((resolve, reject) => {
		PaymentMethod.find({ $and: [{ mercadopagoAPIKey: { $exists: true } }, { mercadopagoAPIKey: { $ne: '' } }, { mercadopagoAPIKey: { $ne: null } }] })
			.exec((err, paymentMethods) => {
				if (err) {
					reject(err);
				} else {
					if (paymentMethods && paymentMethods.length > 0) {
						resolve(paymentMethods[0]);
					} else {
						reject(null);
					}
				}
			});
	});
}

async function searchPayment(transactionId) {
	return new Promise(async (resolve, reject) => {
		let mercadopagoAPIKey;
		await getPaymentMethodMercadopago().then(paymentMethod => {
			mercadopagoAPIKey = paymentMethod.mercadopagoAPIKey;
			if (mercadopagoAPIKey) {
				mp.configurations.setAccessToken(mercadopagoAPIKey);
				let filters = {
					external_reference: transactionId
				};
				mp.payment.search({
					qs: filters
				}).then(function (data) {
					resolve(data);
				}).catch(function (error) {
					reject(error);
				});
			} else {
				reject('No tiene configurado la mercadopago APIKey y clientID');
			}
		}).catch(error => {
			reject(error);
		});
	});
}

function initConnectionDB(database) {

	const Model = require('./../models/model');

	let PaymentMethodSchema = require('./../models/payment-method');
	PaymentMethod = new Model('payment-method', {
		schema: PaymentMethodSchema,
		connection: database
	});

	let TransactionSchema = require('./../models/transaction');
	Transaction = new Model('transaction', {
		schema: TransactionSchema,
		connection: database
	});

	let MovementOfCashSchema = require('./../models/movement-of-cash');
	MovementOfCash = new Model('movements-of-cash', {
		schema: MovementOfCashSchema,
		connection: database
	});
}

module.exports = {
	generatePaymentLink,
	searchPayment,
	verifyPayments,
	startPaymentVerificationTask,
	verifyPaymentsByClient
}