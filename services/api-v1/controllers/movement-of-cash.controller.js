'use strict'

let fileController = require('./file.controller');
let constants = require('./../utilities/constants');
const { EJSON } = require('bson');
let moment = require('moment');
moment.locale('es');

let MovementOfCash;
let Transaction;
let PaymentMethod;
let Company;
let TransactionType;
let User;
let Bank;
let CashBox;


function getMovementOfCash(req, res, next, id = undefined) {

	initConnectionDB(req.session.database);

	let movementOfCashId;
	if (id) {
		movementOfCashId = id;
	} else {
		movementOfCashId = req.query.id;
	}

	MovementOfCash.findById(movementOfCashId, (err, movementOfCash) => {
		if (err) {
			fileController.writeLog(req, res, next, 500, err);
			return res.status(500).send(constants.ERR_SERVER);
		} else {
			if (!movementOfCash || movementOfCash.operationType == 'D') {
				fileController.writeLog(req, res, next, 404, constants.NO_DATA_FOUND);
				return res.status(404).send(constants.NO_DATA_FOUND);
			} else {
				Transaction.populate(movementOfCash, { path: 'transaction' }, (err, movementOfCash) => {
					if (err) {
						fileController.writeLog(req, res, next, 500, err);
						return res.status(500).send(constants.ERR_SERVER);
					} else if (!movementOfCash) {
						fileController.writeLog(req, res, next, 404, constants.NO_DATA_FOUND);
						return res.status(404).send(constants.NO_DATA_FOUND);
					} else {
						PaymentMethod.populate(movementOfCash, { path: 'type' }, (err, movementOfCash) => {
							if (err) {
								fileController.writeLog(req, res, next, 500, err);
								return res.status(500).send(constants.ERR_SERVER);
							} else if (!movementOfCash) {
								fileController.writeLog(req, res, next, 404, constants.NO_DATA_FOUND);
								return res.status(404).send(constants.NO_DATA_FOUND);
							} else {
								fileController.writeLog(req, res, next, 200, movementOfCash);
								return res.status(200).send({ movementOfCash: movementOfCash });
							}
						});
					}
				});
			}
		}
	});
}

function getMovementsOfCashesByCompany(req, res, next) {

	initConnectionDB(req.session.database);

	//http://localhost:3000/api/payments/limit=6&skip=0&select=description,code&sort="code":1&where="description":"s"
	let companyId = req.query.company;

	let where = JSON.parse('{"operationType": {"$ne": "D"}}');

	if (companyId) {

		MovementOfCash.find(where).
			exec((err, movementsOfCashes) => {
				if (err) {
					fileController.writeLog(req, res, next, 500, err);
					return res.status(500).send(constants.ERR_SERVER);
				} else {
					if (!movementsOfCashes) {
						fileController.writeLog(req, res, next, 404, constants.NO_DATA_FOUND);
						return res.status(404).send(constants.NO_DATA_FOUND);
					} else if (movementsOfCashes.length === 0) {
						fileController.writeLog(req, res, next, 200, constants.NO_DATA_FOUND);
						return res.status(200).send({ message: constants.NO_DATA_FOUND });
					} else {
						Transaction.populate(movementsOfCashes, {
							path: 'transaction',
							model: Transaction,
							populate: {
								path: 'company',
								model: Company,
								match: { _id: companyId, }
							}
						}, (err, movementsOfCashes) => {
							if (err) {
								fileController.writeLog(req, res, next, 500, err);
								return res.status(500).send(constants.ERR_SERVER);
							} else if (!movementsOfCashes) {
								fileController.writeLog(req, res, next, 404, constants.NO_DATA_FOUND);
								return res.status(404).send(constants.NO_DATA_FOUND);
							} else {
								PaymentMethod.populate(movementsOfCashes, {
									path: 'type'
								}, (err, movementsOfCashes) => {
									if (err) {
										fileController.writeLog(req, res, next, 500, err);
										return res.status(500).send(constants.ERR_SERVER);
									} else if (!movementsOfCashes) {
										fileController.writeLog(req, res, next, 404, constants.NO_DATA_FOUND);
										return res.status(404).send(constants.NO_DATA_FOUND);
									} else {
										fileController.writeLog(req, res, next, 200, movementsOfCashes.length);
										return res.status(200).send({ movementsOfCashes: movementsOfCashes });
									}
								});
							}
						});
					}
				}
			});
	} else {
		fileController.writeLog(req, res, next, 200, constants.COMPLETE_ALL_THE_DATA);
		return res.status(200).send({ message: constants.COMPLETE_ALL_THE_DATA });
	}
}

function getMovementsOfCashes(req, res, next) {

	initConnectionDB(req.session.database);

	//http://localhost:3000/api/payments/limit=6&skip=0&select=description,code&sort="code":1&where="description":"s"

	let where = JSON.parse('{"operationType": {"$ne": "D"}}');
	let limit = 0;
	let select = "";
	let sort = "";
	let skip = 0;
	let error;

	if (req.query.query !== undefined) {

		req.query.query.split("&").forEach(function (part) {
			let item = part.split("=");
			let json;
			switch (item[0]) {
				case 'where':
					json = '{"$and":[{"operationType": {"$ne": "D"}},';
					json = json + "{" + item[1] + "}]}";
					try {
						where = JSON.parse(json);
					} catch (err) {
						fileController.writeLog(req, res, next, 500, json);
						error = err;
					}
					break;
				case 'limit':
					try {
						limit = parseInt(item[1]);
					} catch (err) {
						error = err;
					}
					break;
				case 'select':
					try {
						select = item[1].replace(/,/g, " ");
					} catch (err) {
						error = err;
					}
					break;
				case 'sort':
					json = "{" + item[1] + "}";
					try {
						sort = JSON.parse(json);
					} catch (err) {
						error = err;
					}
					break;
				case 'skip':
					try {
						skip = parseInt(item[1]);
					} catch (err) {
						error = err;
					}
					break;
				default:
			}
		});
	}

	if (error) {
		fileController.writeLog(req, res, next, 500, error);
		return res.status(500).send(constants.ERR_SERVER);
	}

	MovementOfCash.find(where).
		limit(limit).
		select(select).
		sort(sort).
		skip(skip).
		exec((err, movementsOfCashes) => {
			if (err) {
				fileController.writeLog(req, res, next, 500, err);
				return res.status(500).send(constants.ERR_SERVER);
			} else {
				if (!movementsOfCashes) {
					fileController.writeLog(req, res, next, 404, constants.NO_DATA_FOUND);
					return res.status(404).send(constants.NO_DATA_FOUND);
				} else if (movementsOfCashes.length === 0) {
					fileController.writeLog(req, res, next, 200, constants.NO_DATA_FOUND);
					return res.status(200).send({ message: constants.NO_DATA_FOUND });
				} else {
					Transaction.populate(movementsOfCashes, { path: 'transaction' }, (err, movementsOfCashes) => {
						if (err) {
							fileController.writeLog(req, res, next, 500, err);
							return res.status(500).send(constants.ERR_SERVER);
						} else if (!movementsOfCashes) {
							fileController.writeLog(req, res, next, 404, constants.NO_DATA_FOUND);
							return res.status(404).send(constants.NO_DATA_FOUND);
						} else {
							Bank.populate(movementsOfCashes, { path: 'bank' }, (err, movementsOfCashes) => {
								if (err) {
									fileController.writeLog(req, res, next, 500, err);
									return res.status(500).send(constants.ERR_SERVER);
								} else if (!movementsOfCashes) {
									fileController.writeLog(req, res, next, 404, constants.NO_DATA_FOUND);
									return res.status(404).send(constants.NO_DATA_FOUND);
								} else {
									PaymentMethod.populate(movementsOfCashes, { path: 'type' }, (err, movementsOfCashes) => {
										if (err) {
											fileController.writeLog(req, res, next, 500, err);
											return res.status(500).send(constants.ERR_SERVER);
										} else if (!movementsOfCashes) {
											fileController.writeLog(req, res, next, 404, constants.NO_DATA_FOUND);
											return res.status(404).send(constants.NO_DATA_FOUND);
										} else {
											fileController.writeLog(req, res, next, 200, movementsOfCashes.length);
											return res.status(200).send({ movementsOfCashes: movementsOfCashes });
										}
									});
								}
							});
						}
					});
				}
			}
		});
}

function getMovementsOfCashesV2(req, res, next) {

	initConnectionDB(req.session.database);

	let queryAggregate = [];
	let group;

	if ((req.query && req.query !== {}) && (!req.query.fullQuery || req.query.fullQuery === '[]' || req.query.fullQuery === [])) {

		let error;

		let project = req.query.project;
		if (project && project !== {} && project !== "{}") {
			try {
				project = JSON.parse(project);

				if (searchPropertyOfArray(project, 'bank.')) {
					queryAggregate.push({ $lookup: { from: "banks", foreignField: "_id", localField: "bank", as: "bank" } });
					queryAggregate.push({ $unwind: { path: "$bank", preserveNullAndEmptyArrays: true } });
				}

				if (searchPropertyOfArray(project, 'type.')) {
					queryAggregate.push({ $lookup: { from: "payment-methods", foreignField: "_id", localField: "type", as: "type" } });
					queryAggregate.push({ $unwind: { path: "$type" } });
				}

				if (searchPropertyOfArray(project, 'transaction.')) {
					queryAggregate.push({ $lookup: { from: "transactions", foreignField: "_id", localField: "transaction", as: "transaction" } });
					queryAggregate.push({ $unwind: { path: "$transaction" } });

					if (searchPropertyOfArray(project, 'transaction.type.')) {
						queryAggregate.push({ $lookup: { from: "transaction-types", foreignField: "_id", localField: "transaction.type", as: "transaction.type" } });
						queryAggregate.push({ $unwind: { path: "$transaction.type" } });
					}

					if (searchPropertyOfArray(project, 'transaction.cashBox.')) {
						queryAggregate.push({ $lookup: { from: "cash-boxes", foreignField: "_id", localField: "transaction.cashBox", as: "transaction.cashBox" } });
						queryAggregate.push({ $unwind: { path: "$transaction.cashBox", preserveNullAndEmptyArrays: true } });
					}

					if (searchPropertyOfArray(project, 'transaction.company.')) {
						queryAggregate.push({ $lookup: { from: "companies", foreignField: "_id", localField: "transaction.company", as: "transaction.company" } });
						queryAggregate.push({ $unwind: { path: "$transaction.company", preserveNullAndEmptyArrays: true } });
					}

					if (searchPropertyOfArray(project, 'transaction.branchDestination.')) {
						queryAggregate.push({ $lookup: { from: "branches", foreignField: "_id", localField: "transaction.branchDestination", as: "transaction.branchDestination" } });
						queryAggregate.push({ $unwind: { path: "$transaction.branchDestination", preserveNullAndEmptyArrays: true } });
					}
				}

				if (searchPropertyOfArray(project, 'creationUser.')) {
					queryAggregate.push({ $lookup: { from: "users", foreignField: "_id", localField: "creationUser", as: "creationUser" } });
					queryAggregate.push({ $unwind: { path: "$creationUser", preserveNullAndEmptyArrays: true } });
				}

				if (searchPropertyOfArray(project, 'updateUser.')) {
					queryAggregate.push({ $lookup: { from: "users", foreignField: "_id", localField: "updateUser", as: "updateUser" } });
					queryAggregate.push({ $unwind: { path: "$updateUser", preserveNullAndEmptyArrays: true } });
				}

				let sort = req.query.sort;
				if (sort && sort !== {} && sort !== "{}") {
					try {
						queryAggregate.push({ $sort: JSON.parse(sort) });
					} catch (err) {
						error = err;
					}
				}

				queryAggregate.push({ $project: project });
			} catch (err) {
				error = err;
			}
		} else {
			let sort = req.query.sort;
			if (sort && sort !== {} && sort !== "{}") {
				try {
					queryAggregate.push({ $sort: JSON.parse(sort) });
				} catch (err) {
					error = err;
				}
			}
		}

		let match = req.query.match;
		if (match && match !== "{}" && match !== {}) {
			try {
				queryAggregate.push({ $match: JSON.parse(match) });
			} catch (err) {
				error = err;
			}
		}

		group = req.query.group;
		if (group && group !== "{}" && group !== {}) {
			try {
				queryAggregate.push({ $group: JSON.parse(group) });
			} catch (err) {
				error = err;
			}
		}

		let limit = req.query.limit;
		let skip = req.query.skip;
		if (limit) {
			try {
				limit = parseInt(limit);
				if (limit > 0) {
					if (skip) {
						skip = parseInt(skip);
					} else {
						skip = 0;
					}
					if (group && group !== "{}" && group !== {}) {
						let projectGroup;
						if (searchPropertyOfArray(JSON.parse(group), 'movementsOfCashes')) {
							projectGroup = `{ "movementsOfCashes": { "$slice": ["$movementsOfCashes", ${skip}, ${limit}] }`;
						} else {
							projectGroup = `{ "items": { "$slice": ["$items", ${skip}, ${limit}] }`;
						}
						for (let prop of Object.keys(JSON.parse(group))) {
							if (prop !== 'movementsOfCashes' && prop !== 'items') {
								projectGroup += `, "${prop}": 1`;
							}
						}
						projectGroup += `}`;
						queryAggregate.push({ $project: JSON.parse(projectGroup) });
					} else {
						queryAggregate.push({ $limit: limit });
						queryAggregate.push({ $skip: skip });
					}
				}
			} catch (err) {
				error = err;
			}
		}

		if (error) {
			fileController.writeLog(req, res, next, 500, error);
			return res.status(500).send(error);
		}
	} else {
		queryAggregate = JSON.parse(req.query.fullQuery);
	}

	queryAggregate = EJSON.parse(JSON.stringify(queryAggregate));

	MovementOfCash.aggregate(queryAggregate)
		.allowDiskUse(true)
		.then(function (result) {
			fileController.writeLog(req, res, next, 200, result.length);
			if (result.length > 0) {
				if (group && group !== "{}" && group !== {}) {
					return res.status(200).send(result);
				} else {
					return res.status(200).send({ movementsOfCashes: result });
				}
			} else {
				if (group && group !== "{}" && group !== {}) {
					return res.status(200).send({ count: 0, movementsOfCashes: [] });
				} else {
					return res.status(200).send({ movementsOfCashes: [] });
				}
			}
		}).catch(err => {
			fileController.writeLog(req, res, next, 500, err);
			return res.status(500).send(err);
		});
}

function getMovementsOfCashesV3(req, res, next) {

	initConnectionDB(req.session.database);

	let queryAggregate = EJSON.parse(JSON.stringify(req.body));

	MovementOfCash.aggregate(queryAggregate)
		.allowDiskUse(true)
		.then(function (result) {
			fileController.writeLog(req, res, next, 200, result.length);
			if (result) {
				return res.status(200).send(result);
			}
		}).catch(err => {
			fileController.writeLog(req, res, next, 500, err);
			return res.status(500).send(err);
		});
}

function searchPropertyOfArray(array, value) {
	let n = false;
	for (let a of Object.keys(array)) { if (!n) n = a.includes(value); }
	return n;
}

function getMovementsOfCashesByTransactionMovement(req, res, next) {

	initConnectionDB(req.session.database);

	//http://localhost:3000/api/payments/limit=6&skip=0&select=description,code&sort="code":1&where="description":"s"

	let movement = req.query.movement;
	let where = JSON.parse('{"operationType": {"$ne": "D"}}');
	let limit = 0;
	let select = "";
	let sort = "";
	let skip = 0;
	let error;

	if (req.query.query !== undefined) {

		req.query.query.split("&").forEach(function (part) {
			let item = part.split("=");
			let json;
			switch (item[0]) {
				case 'where':
					json = '{"$and":[{"operationType": {"$ne": "D"}},';
					json = json + "{" + item[1] + "}]}";
					try {
						where = JSON.parse(json);
					} catch (err) {
						fileController.writeLog(req, res, next, 500, json);
						error = err;
					}
					break;
				case 'limit':
					try {
						limit = parseInt(item[1]);
					} catch (err) {
						error = err;
					}
					break;
				case 'select':
					try {
						select = item[1].replace(/,/g, " ");
					} catch (err) {
						error = err;
					}
					break;
				case 'sort':
					json = "{" + item[1] + "}";
					try {
						sort = JSON.parse(json);
					} catch (err) {
						error = err;
					}
					break;
				case 'skip':
					try {
						skip = parseInt(item[1]);
					} catch (err) {
						error = err;
					}
					break;
				default:
			}
		});
	}

	if (error) {
		fileController.writeLog(req, res, next, 500, error);
		return res.status(500).send(constants.ERR_SERVER);
	}

	MovementOfCash.find(where).
		limit(limit).
		select(select).
		sort(sort).
		skip(skip).
		exec((err, movementsOfCashes) => {
			if (err) {
				fileController.writeLog(req, res, next, 500, err);
				return res.status(500).send(constants.ERR_SERVER);
			} else {
				if (!movementsOfCashes) {
					fileController.writeLog(req, res, next, 404, constants.NO_DATA_FOUND);
					return res.status(404).send(constants.NO_DATA_FOUND);
				} else if (movementsOfCashes.length === 0) {
					fileController.writeLog(req, res, next, 200, constants.NO_DATA_FOUND);
					return res.status(200).send({ message: constants.NO_DATA_FOUND });
				} else {
					Transaction.populate(movementsOfCashes, {
						path: 'transaction',
						populate: [{
							path: 'type',
							model: TransactionType,
							match: ({ $and: [{ "transactionMovement": movement }] })
						}, {
							path: 'cash-box',
							model: CashBox
						}],
					}, (err, movementsOfCashes) => {
						if (err) {
							fileController.writeLog(req, res, next, 500, err);
							return res.status(500).send(constants.ERR_SERVER);
						} else if (!movementsOfCashes) {
							fileController.writeLog(req, res, next, 404, constants.NO_DATA_FOUND);
							return res.status(404).send(constants.NO_DATA_FOUND);
						} else {
							PaymentMethod.populate(movementsOfCashes, { path: 'type' }, (err, movementsOfCashes) => {
								if (err) {
									fileController.writeLog(req, res, next, 500, err);
									return res.status(500).send(constants.ERR_SERVER);
								} else if (!movementsOfCashes) {
									fileController.writeLog(req, res, next, 404, constants.NO_DATA_FOUND);
									return res.status(404).send(constants.NO_DATA_FOUND);
								} else {
									Bank.populate(movementsOfCashes, { path: 'bank' }, (err, movementsOfCashes) => {
										if (err) {
											fileController.writeLog(req, res, next, 500, err);
											return res.status(500).send(constants.ERR_SERVER);
										} else if (!movementsOfCashes) {
											fileController.writeLog(req, res, next, 404, constants.NO_DATA_FOUND);
											return res.status(404).send(constants.NO_DATA_FOUND);
										} else {
											let movements = new Array();
											for (let mov of movementsOfCashes) {
												if (mov.transaction && mov.transaction.type !== null) {
													movements.push(mov);
												}
											}
											fileController.writeLog(req, res, next, 200, movements.length);
											return res.status(200).send({ movementsOfCashes: movements });
										}
									});
								}
							});
						}
					});
				}
			}
		});
}

function getShiftClosing(req, res, next) {

	initConnectionDB(req.session.database);

	let turn = req.query.turn;

	let whereTransaction;
	try {
		whereTransaction = JSON.parse('{ "turnClosing" : "' + turn + '" }');
	} catch (err) {
		fileController.writeLog(req, res, next, 500, err);
		return res.status(500).send(constants.ERR_SERVER);
	}

	MovementOfCash.find()
		.populate({
			path: 'transaction',
			model: Transaction,
			match: whereTransaction,
		})
		.exec((err, movementsOfCashes) => {
			if (err) {
				fileController.writeLog(req, res, next, 500, err);
				return res.status(500).send(constants.ERR_SERVER);
			} else {
				if (!movementsOfCashes) {
					fileController.writeLog(req, res, next, 404, constants.NO_DATA_FOUND);
					return res.status(404).send(constants.NO_DATA_FOUND);
				} else if (movementsOfCashes.length === 0) {
					fileController.writeLog(req, res, next, 200, constants.NO_DATA_FOUND);
					return res.status(200).send({ message: constants.NO_DATA_FOUND });
				} else {
					PaymentMethod.populate(movementsOfCashes, { path: 'type' }, (err, movementsOfCashes) => {
						if (err) {
							fileController.writeLog(req, res, next, 500, err);
							return res.status(500).send(constants.ERR_SERVER);
						} else if (!movementsOfCashes) {
							fileController.writeLog(req, res, next, 404, constants.NO_DATA_FOUND);
							return res.status(404).send(constants.NO_DATA_FOUND);
						} else {
							let shiftClosing = calculateShiftClosing(movementsOfCashes);
							fileController.writeLog(req, res, next, 200, "shiftClosing = " + shiftClosing);
							return res.status(200).send({ shiftClosing: shiftClosing });
						}
					});
				}
			}
		});
}

function calculateShiftClosing(movementsOfCashes) {

	let cashAmount = 0;
	let currentAccountAmount = 0;
	let creaditCardAmount = 0;
	let creaditDebitAmount = 0;
	let thirdPartyCheckAmount = 0;

	for (let movementOfCash of movementsOfCashes) {
		if (movementOfCash.transaction !== null) {
			switch (movementOfCash.type.name) {
				case 'Efectivo':
					cashAmount += movementOfCash.amountPaid;
					break;
				case 'Cuenta Corriente':
					currentAccountAmount += movementOfCash.amountPaid;
					break;
				case 'Tarjeta de Crédito':
					creaditCardAmount += movementOfCash.amountPaid;
					break;
				case 'Tarjeta de Débito':
					creaditDebitAmount += movementOfCash.amountPaid;
					break;
				case 'Cheque de Terceros':
					thirdPartyCheckAmount += movementOfCash.amountPaid;
					break;
				default:
					break;
			}
		}
	}

	let json = {
		"cash": cashAmount,
		"currentAccount": currentAccountAmount,
		"creditCard": creaditCardAmount,
		"debitCard": creaditDebitAmount,
		"thirdPartyCheck": thirdPartyCheckAmount
	};

	return json;
}

function saveMovementOfCash(req, res, next) {

	initConnectionDB(req.session.database);

	let movementOfCash = new MovementOfCash();
	let params = req.body;

	movementOfCash.date = params.date;
	movementOfCash.expirationDate = params.expirationDate;
	movementOfCash.statusCheck = params.statusCheck;
	movementOfCash.discount = params.discount;
	movementOfCash.surcharge = params.surcharge;
	movementOfCash.quota = params.quota;
	movementOfCash.capital = params.capital;
	movementOfCash.interestPercentage = params.interestPercentage;
	movementOfCash.interestAmount = params.interestAmount;
	movementOfCash.taxPercentage = params.taxPercentage;
	movementOfCash.taxAmount = params.taxAmount;
	movementOfCash.amountPaid = params.amountPaid;
	movementOfCash.amountDiscount = params.amountDiscount;
	movementOfCash.balanceCanceled = params.balanceCanceled;
	movementOfCash.observation = params.observation;
	movementOfCash.type = params.type;
	movementOfCash.transaction = params.transaction;
	movementOfCash.receiver = params.receiver;
	movementOfCash.number = params.number;
	movementOfCash.bank = params.bank;
	movementOfCash.titular = params.titular;
	movementOfCash.CUIT = params.CUIT;
	movementOfCash.deliveredBy = params.deliveredBy;
	movementOfCash.paymentChange = params.paymentChange;
	movementOfCash.currencyValues = params.currencyValues;
	movementOfCash.commissionAmount = params.commissionAmount;
	movementOfCash.administrativeExpenseAmount = params.administrativeExpenseAmount;
	movementOfCash.otherExpenseAmount = params.otherExpenseAmount;

	let user = new User();
	user._id = req.session.user;
	movementOfCash.creationUser = user;
	movementOfCash.creationDate = moment().format('YYYY-MM-DDTHH:mm:ssZ');
	movementOfCash.operationType = 'C';

	movementOfCash.save((err, movementOfCashSaved) => {
		if (err) {
			fileController.writeLog(req, res, next, 500, err);
			return res.status(500).send(constants.ERR_SERVER);
		} else {
			Transaction.populate(movementOfCashSaved, { path: 'transaction' }, (err, movementOfCashSaved) => {
				if (err) {
					fileController.writeLog(req, res, next, 500, err);
					return res.status(500).send(constants.ERR_SERVER);
				} else if (!movementOfCashSaved) {
					fileController.writeLog(req, res, next, 404, constants.NO_DATA_FOUND);
					return res.status(404).send(constants.NO_DATA_FOUND);
				} else {
					getMovementOfCash(req, res, next, movementOfCashSaved._id);
				}
			});
		}
	});

}

function saveMovementsOfCashes(req, res, next) {

	initConnectionDB(req.session.database);

	let params = req.body;

	let movementsOfCashes = params.movementsOfCashes;

	let user = new User();
	user._id = req.session.user;

	for (let mov of movementsOfCashes) {
		mov.creationUser = user;
		mov.creationDate = moment().format('YYYY-MM-DDTHH:mm:ssZ');
		mov.operationType = 'C';
	}

	MovementOfCash.create(movementsOfCashes, (err, movementsOfCashesSaved) => {
		if (err) {
			fileController.writeLog(req, res, next, 500, err);
			return res.status(500).send(constants.ERR_SERVER);
		} else {
			fileController.writeLog(req, res, next, 200, movementsOfCashesSaved.length);
			return res.status(200).send({ movementsOfCashes: movementsOfCashesSaved });
		}
	});
}

function updateMovementOfCash(req, res, next) {

	initConnectionDB(req.session.database);

	let movementOfCashId = req.query.id;
	let movementOfCash = req.body;

	let user = new User();
	user._id = req.session.user;
	movementOfCash.updateUser = user;
	movementOfCash.updateDate = moment().format('YYYY-MM-DDTHH:mm:ssZ');
	movementOfCash.operationType = 'U';

	MovementOfCash.findByIdAndUpdate(movementOfCashId, movementOfCash, (err, movementOfCashUpdate) => {
		if (err) {
			fileController.writeLog(req, res, next, 500, err);
			return res.status(500).send(constants.ERR_SERVER);
		} else {
			getMovementOfCash(req, res, next, movementOfCashUpdate._id);
		}
	});
}

function deleteMovementOfCash(req, res, next) {

	initConnectionDB(req.session.database);

	let movementOfCashId = req.query.id;

	let user = new User();
	user._id = req.session.user;

	MovementOfCash.findByIdAndUpdate(movementOfCashId,
		{
			$set: {
				updateUser: user,
				updateDate: moment().format('YYYY-MM-DDTHH:mm:ssZ'),
				operationType: 'D'
			}
		}, (err, movementOfCashUpdate) => {
			if (err) {
				fileController.writeLog(req, res, next, 500, err);
				return res.status(500).send(constants.ERR_SERVER);
			} else {
				fileController.writeLog(req, res, next, 200, movementOfCashUpdate._id);
				return res.status(200).send({ movementOfCash: movementOfCashUpdate });
			}
		});
}

function deleteMovementsOfCashes(req, res, next) {

	initConnectionDB(req.session.database);

	let query = req.query.query;

	let user = new User();
	user._id = req.session.user;

	let where = JSON.parse(query);
	let set = JSON.parse('{ "$set": { "updateUser": "' + user._id + '", "updateDate": "' + moment().format('YYYY-MM-DDTHH:mm:ssZ') + '","operationType": "D"}}');

	MovementOfCash.update(where, set, { multi: true }, (err, movementsOfCashesUpdate) => {
		if (err) {
			fileController.writeLog(req, res, next, 500, err);
			return res.status(500).send(constants.ERR_SERVER);
		} else {
			fileController.writeLog(req, res, next, 200, movementsOfCashesUpdate);
			getMovementsOfCashes(req, res, next);
		}
	});
}

function initConnectionDB(database) {

	const Model = require('./../models/model');

	let MovementOfCashSchema = require('./../models/movement-of-cash');
	MovementOfCash = new Model('movements-of-cash', {
		schema: MovementOfCashSchema,
		connection: database
	});

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

	let CompanySchema = require('./../models/company');
	Company = new Model('company', {
		schema: CompanySchema,
		connection: database
	});

	let TransactionTypeSchema = require('./../models/transaction-type');
	TransactionType = new Model('transaction-type', {
		schema: TransactionTypeSchema,
		connection: database
	});

	let BankSchema = require('./../models/bank');
	Bank = new Model('bank', {
		schema: BankSchema,
		connection: database
	});

	let CashBoxSchema = require('./../models/cash-box');
	CashBox = new Model('cash-box', {
		schema: CashBoxSchema,
		connection: database
	});

	let UserSchema = require('./../models/user');
	User = new Model('user', {
		schema: UserSchema,
		connection: database
	});
}

module.exports = {
	getMovementOfCash,
	getMovementsOfCashes,
	getMovementsOfCashesV2,
	getMovementsOfCashesV3,
	getMovementsOfCashesByTransactionMovement,
	getMovementsOfCashesByCompany,
	getShiftClosing,
	saveMovementOfCash,
	saveMovementsOfCashes,
	updateMovementOfCash,
	deleteMovementOfCash,
	deleteMovementsOfCashes,
}