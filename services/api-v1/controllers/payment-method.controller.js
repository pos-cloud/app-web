'use strict'

let fileController = require('./file.controller');
let constants = require('./../utilities/constants');
const { EJSON } = require('bson');
let moment = require('moment');
moment.locale('es');

let PaymentMethod;
let User;
let MovementOfCash;
let Application;
let Article;
let Account;
let Currency;

function getPaymentMethod(req, res, next, id = undefined) {

	initConnectionDB(req.session.database);

	let paymentMethodId;
	if (id) {
		paymentMethodId = id;
	} else {
		paymentMethodId = req.query.id;
	}

	PaymentMethod.findById(paymentMethodId, (err, paymentMethod) => {
		if (err) {
			fileController.writeLog(req, res, next, 500, err);
			return res.status(500).send(constants.ERR_SERVER);
		} else {
			if (!paymentMethod || paymentMethod.operationType == 'D') {
				fileController.writeLog(req, res, next, 404, constants.NO_DATA_FOUND);
				return res.status(404).send(constants.NO_DATA_FOUND);
			} else {
				fileController.writeLog(req, res, next, 200, paymentMethod);
				return res.status(200).send({ paymentMethod: paymentMethod });
			}
		}
	}).populate({
		path: 'discountArticle',
		model: Article,
	}).populate({
		path: 'surchargeArticle',
		model: Article,
	}).populate({
		path: 'commissionArticle',
		model: Article,
	}).populate({
		path: 'administrativeExpenseArticle',
		model: Article,
	}).populate({
		path: 'otherExpenseArticle',
		model: Article,
	}).populate({
		path: 'applications',
		model: Application,
	}).populate({
		path: 'account',
		model: Account,
	}).populate({
		path: 'currency',
		model: Currency,
	}).populate({
		path: 'creationUser',
		model: User
	}).populate({
		path: 'updateUser',
		model: User
	});
}

function getPaymentMethods(req, res, next) {

	initConnectionDB(req.session.database);

	//http://localhost:3000/api/paymentMethods/limit=6&skip=0&select=description,code&sort="code":1&where="description":"s"

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

	PaymentMethod
		.find(where)
		.limit(limit)
		.select(select)
		.sort(sort)
		.skip(skip)
		.populate({
			path: 'discountArticle',
			model: Article,
		})
		.populate({
			path: 'surchargeArticle',
			model: Article,
		})
		.populate({
			path: 'commissionArticle',
			model: Article,
		})
		.populate({
			path: 'administrativeExpenseArticle',
			model: Article,
		})
		.populate({
			path: 'otherExpenseArticle',
			model: Article,
		})
		.populate({
			path: 'applications',
			model: Application,
		})
		.populate({
			path: 'currency',
			model: Currency,
		})
		.populate({
			path: 'creationUser',
			model: User
		})
		.populate({
			path: 'updateUser',
			model: User
		})
		.exec((err, paymentMethods) => {
			if (err) {
				fileController.writeLog(req, res, next, 500, err);
				return res.status(500).send(constants.ERR_SERVER);
			} else {
				User.populate(paymentMethods, { path: 'creationUser' }, (err, paymentMethods) => {
					if (err) {
						fileController.writeLog(req, res, next, 500, err);
						return res.status(500).send(constants.ERR_SERVER);
					} else {
						User.populate(paymentMethods, { path: 'updateUser' }, (err, paymentMethods) => {
							if (err) {
								fileController.writeLog(req, res, next, 500, err);
								return res.status(500).send(constants.ERR_SERVER);
							} else {
								if (!paymentMethods) {
									fileController.writeLog(req, res, next, 404, constants.NO_DATA_FOUND);
									return res.status(404).send(constants.NO_DATA_FOUND);
								} else if (paymentMethods.length === 0) {
									fileController.writeLog(req, res, next, 200, constants.NO_DATA_FOUND);
									return res.status(200).send({ message: constants.NO_DATA_FOUND });
								} else {
									fileController.writeLog(req, res, next, 200, paymentMethods.length);
									return res.status(200).send({ paymentMethods: paymentMethods });
								}
							}
						});
					}
				});
			}
		});
}

function getPaymentMethodsV2(req, res, next) {

	initConnectionDB(req.session.database);

	let queryAggregate = [];
	let group;

	if (req.query && req.query !== {}) {

		let error;

		let project = req.query.project;
		if (project && project !== {} && project !== "{}") {
			try {
				project = JSON.parse(project);

				if (searchPropertyOfArray(project, 'commissionArticle.') || searchPropertyOfArray(project, 'commissionArticle')) {
					queryAggregate.push({ $lookup: { from: "articles", foreignField: "_id", localField: "commissionArticle", as: "commissionArticle" } });
					queryAggregate.push({ $unwind: { path: "$commissionArticle", preserveNullAndEmptyArrays: true } });
				}

				if (searchPropertyOfArray(project, 'administrativeExpenseArticle.') || searchPropertyOfArray(project, 'administrativeExpenseArticle')) {
					queryAggregate.push({ $lookup: { from: "articles", foreignField: "_id", localField: "administrativeExpenseArticle", as: "administrativeExpenseArticle" } });
					queryAggregate.push({ $unwind: { path: "$administrativeExpenseArticle", preserveNullAndEmptyArrays: true } });
				}

				if (searchPropertyOfArray(project, 'otherExpenseArticle.') || searchPropertyOfArray(project, 'otherExpenseArticle')) {
					queryAggregate.push({ $lookup: { from: "articles", foreignField: "_id", localField: "otherExpenseArticle", as: "otherExpenseArticle" } });
					queryAggregate.push({ $unwind: { path: "$otherExpenseArticle", preserveNullAndEmptyArrays: true } });
				}

				if (searchPropertyOfArray(project, 'currency.') || searchPropertyOfArray(project, 'currency')) {
					queryAggregate.push({ $lookup: { from: "currencies", foreignField: "_id", localField: "currency", as: "currency" } });
					queryAggregate.push({ $unwind: { path: "$currency", preserveNullAndEmptyArrays: true } });
				}

				if (searchPropertyOfArray(project, 'applications.') || searchPropertyOfArray(project, 'applicationsName')) {
					queryAggregate.push({ $lookup: { from: "applications", foreignField: "_id", localField: "applications", as: "applications" } });
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
						if (searchPropertyOfArray(JSON.parse(group), 'paymentMethods')) {
							projectGroup = `{ "paymentMethods": { "$slice": ["$paymentMethods", ${skip}, ${limit}] }`;
						} else {
							projectGroup = `{ "items": { "$slice": ["$items", ${skip}, ${limit}] }`;
						}
						for (let prop of Object.keys(JSON.parse(group))) {
							if (prop !== 'paymentMethods' && prop !== 'items') {
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
	}

	queryAggregate = EJSON.parse(JSON.stringify(queryAggregate));

	PaymentMethod.aggregate(queryAggregate)
		.then(function (result) {
			fileController.writeLog(req, res, next, 200, result.length);
			if (result.length > 0) {
				if (group && group !== "{}" && group !== {}) {
					return res.status(200).send(result);
				} else {
					return res.status(200).send({ paymentMethods: result });
				}
			} else {
				if (group && group !== "{}" && group !== {}) {
					return res.status(200).send({ count: 0, paymentMethods: [] });
				} else {
					return res.status(200).send({ paymentMethods: [] });
				}
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

function savePaymentMethod(req, res, next) {

	initConnectionDB(req.session.database);
	let params = req.body;

    let paymentMethod = new PaymentMethod();
    paymentMethod.order = params.order;
	paymentMethod.code = params.code;
	paymentMethod.name = params.name;
	paymentMethod.discount = params.discount;
	paymentMethod.discountArticle = params.discountArticle;
	paymentMethod.surcharge = params.surcharge;
	paymentMethod.surchargeArticle = params.surchargeArticle;
	paymentMethod.isCurrentAccount = params.isCurrentAccount;
	paymentMethod.acceptReturned = params.acceptReturned;
	paymentMethod.inputAndOuput = params.inputAndOuput;
	paymentMethod.checkDetail = params.checkDetail;
	paymentMethod.cardDetail = params.cardDetail;
	paymentMethod.allowToFinance = params.allowToFinance;
	paymentMethod.payFirstQuota = params.payFirstQuota;
	paymentMethod.cashBoxImpact = params.cashBoxImpact;
	paymentMethod.company = params.company;
	paymentMethod.bankReconciliation = params.bankReconciliation;
	paymentMethod.currency = params.currency;
	paymentMethod.allowCurrencyValue = params.allowCurrencyValue;
	paymentMethod.observation = params.observation;
	paymentMethod.allowBank = params.allowToBank;
	paymentMethod.mercadopagoAPIKey = params.mercadopagoAPIKey;
	paymentMethod.mercadopagoClientId = params.mercadopagoClientId;
    paymentMethod.mercadopagoAccessToken = params.mercadopagoAccessToken;
	paymentMethod.applications = params.applications;
	paymentMethod.commission = params.commission;
	paymentMethod.commissionArticle = params.commissionArticle,
	paymentMethod.administrativeExpense = params.administrativeExpense;
	paymentMethod.administrativeExpenseArticle = params.administrativeExpenseArticle;
	paymentMethod.otherExpense = params.otherExpense;
	paymentMethod.otherExpenseArticle = params.otherExpenseArticle;
	paymentMethod.checkPerson = params.checkPerson;

	let user = new User();
	user._id = req.session.user;
	paymentMethod.creationUser = user;
	paymentMethod.creationDate = moment().format('YYYY-MM-DDTHH:mm:ssZ');
	paymentMethod.operationType = 'C';

	if (paymentMethod.name) {

		let json = '{"$and":[{"operationType": {"$ne": "D"}},';
		json = json + '{"name": "' + paymentMethod.name + '"}]}';
		let where;
		try {
			where = JSON.parse(json);
		} catch (err) {
			fileController.writeLog(req, res, next, 500, json);
			fileController.writeLog(req, res, next, 500, err);
			return res.status(500).send(constants.ERR_SERVER);
		}

		PaymentMethod.find(where).exec((err, paymentMethods) => {
			if (err) {
				fileController.writeLog(req, res, next, 500, err);
				return res.status(500).send(constants.ERR_SERVER);
			} else {
				if (!paymentMethods || paymentMethods.length === 0) {
					paymentMethod.save((err, paymentMethodSaved) => {
						if (err) {
							fileController.writeLog(req, res, next, 500, err);
							return res.status(500).send(constants.ERR_SERVER);
						} else {
							getPaymentMethod(req, res, next, paymentMethodSaved._id);
						}
					});
				} else {
					let message = 'El medio de pago \"' + paymentMethod.name + '\" ya existe';
					fileController.writeLog(req, res, next, 200, message);
					return res.status(200).send({ message: message });
				}
			}
		});
	} else {
		fileController.writeLog(req, res, next, 200, constants.COMPLETE_ALL_THE_DATA);
		return res.status(200).send({ message: constants.COMPLETE_ALL_THE_DATA });
	}
}

function updatePaymentMethod(req, res, next) {

	initConnectionDB(req.session.database);

	let paymentMethodId = req.query.id;
	let paymentMethod = req.body;

	let user = new User();
	user._id = req.session.user;
	paymentMethod.updateUser = user;
	paymentMethod.updateDate = moment().format('YYYY-MM-DDTHH:mm:ssZ');
	paymentMethod.operationType = 'U';

	if (paymentMethod.name) {

		let json = '{"$and":[{"operationType": {"$ne": "D"}},';
		json = json + '{"name": "' + paymentMethod.name + '"},';
		json = json + '{"_id": {"$ne": "' + paymentMethodId + '"}}]}';
		let where;
		try {
			where = JSON.parse(json);
		} catch (err) {
			fileController.writeLog(req, res, next, 500, json);
			fileController.writeLog(req, res, next, 500, err);
			return res.status(500).send(constants.ERR_SERVER);
		}

		PaymentMethod.find(where).exec((err, paymentMethods) => {
			if (err) {
				fileController.writeLog(req, res, next, 500, err);
				return res.status(500).send(constants.ERR_SERVER);
			} else {
				if (!paymentMethods || paymentMethods.length === 0) {
					PaymentMethod.findByIdAndUpdate(paymentMethodId, paymentMethod, (err, paymentMethodUpdated) => {
						if (err) {
							fileController.writeLog(req, res, next, 500, err);
							return res.status(500).send(constants.ERR_SERVER);
						} else {
							getPaymentMethod(req, res, next, paymentMethodUpdated._id);
						}
					});
				} else {
					let message = 'El medio de pago \"' + paymentMethod.name + '\" ya existe';
					fileController.writeLog(req, res, next, 200, message);
					return res.status(200).send({ message: message });
				}
			}
		});
	} else {
		fileController.writeLog(req, res, next, 200, constants.COMPLETE_ALL_THE_DATA);
		return res.status(200).send({ message: constants.COMPLETE_ALL_THE_DATA });
	}
}

function deletePaymentMethod(req, res, next) {

	initConnectionDB(req.session.database);

	let paymentMethodId = req.query.id;

	let user = new User();
	user._id = req.session.user;

	PaymentMethod.findByIdAndUpdate(paymentMethodId,
		{
			$set: {
				updateUser: user,
				updateDate: moment().format('YYYY-MM-DDTHH:mm:ssZ'),
				operationType: 'D'
			}
		}, (err, paymentMethodUpdated) => {
			if (err) {
				fileController.writeLog(req, res, next, 500, err);
				return res.status(500).send(constants.ERR_SERVER);
			} else {
				fileController.writeLog(req, res, next, 200, paymentMethodUpdated._id);
				return res.status(200).send({ paymentMethod: paymentMethodUpdated });
			}
		});
}

function getSalesByPaymentMethod(req, res, next) {

	const mongoose = require('mongoose');

	initConnectionDB(req.session.database);

	let query;
	try {
		query = JSON.parse(req.query.query);
	} catch (err) {
		fileController.writeLog(req, res, next, 500, err);
		return res.status(500).send(constants.ERR_SERVER);
	}

	let type = query.type;
	let startDate = query.startDate;
	let endDate = query.endDate;
	let sort = query.sort;
	let limit = query.limit;
	let branch = query.branch;

	let queryAggregate = [];
	queryAggregate.push({
		$lookup:
		{
			from: "payment-methods",
			localField: "type",
			foreignField: "_id",
			as: "type"
		}
	});
	queryAggregate.push({
		$unwind: "$type"
	});
	queryAggregate.push({
		$lookup:
		{
			from: "transactions",
			localField: "transaction",
			foreignField: "_id",
			as: "transaction"
		}
	});
	queryAggregate.push({
		$unwind: "$transaction"
	});
	queryAggregate.push({
		$match: {
			$and: [
				{
					"transaction.endDate": {
						$gte: new Date(startDate)
					}
				},
				{
					"transaction.endDate": {
						$lte: new Date(endDate)
					}
				},
				{
					"transaction.state": "Cerrado",
				},
				{
					"transaction.operationType": { "$ne": "D" }
				},
				{
					"operationType": { "$ne": "D" }
				}
			]
		}
	});
	if (branch && branch !== "") {
		queryAggregate.push({
			$match:
			{
				"transaction.branchDestination": mongoose.Types.ObjectId(branch)
			}
		});
	}
	queryAggregate.push({
		$lookup:
		{
			from: "transaction-types",
			localField: "transaction.type",
			foreignField: "_id",
			as: "transaction.type"
		}
	});
	queryAggregate.push({
		$unwind: "$transaction.type"
	});
	queryAggregate.push({
		$match:
		{
			$and:
				[
					{
						"transaction.type.transactionMovement": type,
						"transaction.type.currentAccount": { $ne: "No" }
					}
				],
		}
	});
	queryAggregate.push({
		$project: {
			type: "$type",
			count: {
				$cond:
					[
						{
							$and:
								[
									{ $eq: ["$transaction.type.movement", "Entrada"] }
								]
						}, 1, -1
					],
			},
			amountPaid: {
				$cond:
					[
						{
							$and:
								[
									{ $eq: ["$transaction.type.movement", "Entrada"] }
								]
						}, "$amountPaid", { $multiply: ["$amountPaid", -1] }
					],
			},
		}
	});
	queryAggregate.push({
		$group: {
			_id: "$type",
			count: { $sum: "$count" },
			total: { $sum: "$amountPaid" }
		}
	});
	queryAggregate.push({
		$project: {
			type: "$_id",
			count: 1,
			total: 1
		}
	});
	queryAggregate.push({ $sort: sort });

	if (limit && limit != 0) {
		queryAggregate.push({ $limit: limit });
	}

	MovementOfCash.aggregate(queryAggregate).
		then(function (result) {
			fileController.writeLog(req, res, next, 200, result.length);
			return res.status(200).send(result);
		}).catch(err => {
			fileController.writeLog(req, res, next, 500, err);
			return res.status(500).send(err);
		});
}

function initConnectionDB(database) {

	const Model = require('./../models/model');

	let PaymentMethodSchema = require('./../models/payment-method');
	PaymentMethod = new Model('payment-method', {
		schema: PaymentMethodSchema,
		connection: database
	});

	let ArticleSchema = require('./../models/article');
	Article = new Model('article', {
		schema: ArticleSchema,
		connection: database
	});

	let MovementOfCashSchema = require('./../models/movement-of-cash');
	MovementOfCash = new Model('movements-of-cash', {
		schema: MovementOfCashSchema,
		connection: database
	});

	let CurrencySchema = require('./../models/currency');
	Currency = new Model('currency', {
		schema: CurrencySchema,
		connection: database
	});

	let UserSchema = require('./../models/user');
	User = new Model('user', {
		schema: UserSchema,
		connection: database
	});

	let ApplicationSchema = require('./../models/application');
	Application = new Model('application', {
		schema: ApplicationSchema,
		connection: database
	});

    let AccountSchema = require('./../models/account');
	Account = new Model('account', {
		schema: AccountSchema,
		connection: database
	});
}

module.exports = {
	getPaymentMethod,
	getPaymentMethods,
	getPaymentMethodsV2,
	savePaymentMethod,
	updatePaymentMethod,
	deletePaymentMethod,
	getSalesByPaymentMethod
}
