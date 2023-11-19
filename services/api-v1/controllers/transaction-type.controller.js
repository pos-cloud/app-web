'use strict'

let fileController = require('./file.controller');
let constants = require('./../utilities/constants');
const { EJSON } = require('bson');
let moment = require('moment');
moment.locale('es');

let TransactionType;
let Printer;
let User;
let EmployeeType;
let PaymentMethod;
let UseOfCFDI;
let EmailTemplate;
let Branch;
let ShipmentMethod;
let Application;

function getTransactionType(req, res, next, id = undefined) {

	initConnectionDB(req.session.database);

	let transactionTypeId;
	if (id) {
		transactionTypeId = id;
	} else {
		transactionTypeId = req.query.id;
	}

	TransactionType.findById(transactionTypeId, (err, transactionType) => {
		if (err) {
			fileController.writeLog(req, res, next, 500, err);
			return res.status(500).send(constants.ERR_SERVER);
		} else {
			if (!transactionType || transactionType.operationType == 'D') {
				fileController.writeLog(req, res, next, 404, constants.NO_DATA_FOUND);
				return res.status(404).send(constants.NO_DATA_FOUND);
			} else {
				fileController.writeLog(req, res, next, 200, transactionType);
				return res.status(200).send({ transactionType: transactionType });
			}

		}
	}).populate({
		path: 'application',
		model: Application,
		match: { 'operationType': { $ne: "D" } }
	}).populate({
		path: 'defectUseOfCFDI',
		model: UseOfCFDI,
		match: { 'operationType': { $ne: "D" } }
	}).populate({
		path: 'defectShipmentMethod',
		model: ShipmentMethod,
		match: { 'operationType': { $ne: "D" } }
	}).populate({
		path: 'defectEmailTemplate',
		model: EmailTemplate,
		match: { 'operationType': { $ne: "D" } }
	}).populate({
		path: 'branch',
		model: Branch,
		match: { 'operationType': { $ne: "D" } }
	}).populate({
		path: 'fastPayment',
		model: PaymentMethod,
		match: { 'operationType': { $ne: "D" } }
	}).populate({
		path: 'requestEmployee',
		model: EmployeeType,
		match: { 'operationType': { $ne: "D" } }
	}).populate({
		path: 'defectPrinter',
		model: Printer,
		match: { 'operationType': { $ne: "D" } }
	}).populate({
		path: 'updateUser',
		model: User
	}).populate({
		path: 'creationUser',
		model: User
	});
}

function getAsync(database, transactionTypeId) {

	initConnectionDB(database);

	return new Promise((resolve, reject) => {
		TransactionType.findById(transactionTypeId, (err, transactionType) => {
			if (err) {
				reject(err);
			} else {
				resolve(transactionType);
			}
		});
	});
}

function getTransactionTypes(req, res, next) {

	initConnectionDB(req.session.database);

	//http://localhost:3000/api/articles/limit=6&skip=0&select=description,code&sort="code":1&where="description":"s"

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

	TransactionType
		.find(where)
		.limit(limit)
		.select(select)
		.sort(sort)
		.skip(skip)
		.populate({
			path: 'application',
			model: Application,
			match: { 'operationType': { $ne: "D" } }
		}).populate({
			path: 'defectUseOfCFDI',
			model: UseOfCFDI,
			match: { 'operationType': { $ne: "D" } }
		}).populate({
			path: 'defectShipmentMethod',
			model: ShipmentMethod,
			match: { 'operationType': { $ne: "D" } }
		}).populate({
			path: 'defectEmailTemplate',
			model: EmailTemplate,
			match: { 'operationType': { $ne: "D" } }
		}).populate({
			path: 'branch',
			model: Branch,
			match: { 'operationType': { $ne: "D" } }
		}).populate({
			path: 'fastPayment',
			model: PaymentMethod,
			match: { 'operationType': { $ne: "D" } }
		}).populate({
			path: 'requestEmployee',
			model: EmployeeType,
			match: { 'operationType': { $ne: "D" } }
		}).populate({
			path: 'defectPrinter',
			model: Printer,
			match: { 'operationType': { $ne: "D" } }
		}).populate({
			path: 'updateUser',
			model: User
		}).populate({
			path: 'creationUser',
			model: User
		})
		.exec((err, transactionTypes) => {
			if (err) {
				fileController.writeLog(req, res, next, 500, err);
				return res.status(500).send(constants.ERR_SERVER);
			} else {
				if (!transactionTypes) {
					fileController.writeLog(req, res, next, 404, constants.NO_DATA_FOUND);
					return res.status(404).send(constants.NO_DATA_FOUND);
				} else if (transactionTypes.length === 0) {
					fileController.writeLog(req, res, next, 200, constants.NO_DATA_FOUND);
					return res.status(200).send({ message: constants.NO_DATA_FOUND });
				} else {
					fileController.writeLog(req, res, next, 200, transactionTypes);
					return res.status(200).send({ transactionTypes: transactionTypes });
				}
			}
		});
}

function getTransactionTypesV2(req, res, next) {

	initConnectionDB(req.session.database);

	let queryAggregate = [];
	let group;

	if (req.query && req.query !== {}) {

		let error;

		let project = req.query.project;
		if (project && project !== {} && project !== "{}") {
			try {
				project = JSON.parse(project);

				if (searchPropertyOfArray(project, 'requestEmployee')) {
					queryAggregate.push(
						{
							$lookup: {
								from: 'employee-types',
								let: { pid: '$requestEmployee' },
								pipeline: [
									{ $match: { $expr: { $and: [{ $eq: ['$_id', '$$pid'] }, { $ne: ['$operationType', 'D'] }] } } }
								],
								as: 'requestEmployee'
							}
						});
					queryAggregate.push({ $unwind: { path: "$requestEmployee", preserveNullAndEmptyArrays: true } });
				}

				if (searchPropertyOfArray(project, 'fastPayment')) {
					queryAggregate.push(
						{
							$lookup: {
								from: 'payment-methods',
								let: { pid: '$fastPayment' },
								pipeline: [
									{ $match: { $expr: { $and: [{ $eq: ['$_id', '$$pid'] }, { $ne: ['$operationType', 'D'] }] } } }
								],
								as: 'fastPayment'
							}
						});
					queryAggregate.push({ $unwind: { path: "$fastPayment", preserveNullAndEmptyArrays: true } });
				}

				if (searchPropertyOfArray(project, 'defectPrinter')) {
					queryAggregate.push(
						{
							$lookup: {
								from: 'printers',
								let: { pid: '$defectPrinter' },
								pipeline: [
									{ $match: { $expr: { $and: [{ $eq: ['$_id', '$$pid'] }, { $ne: ['$operationType', 'D'] }] } } }
								],
								as: 'defectPrinter'
							}
						});
					queryAggregate.push({ $unwind: { path: "$defectPrinter", preserveNullAndEmptyArrays: true } });
				}

				if (searchPropertyOfArray(project, 'defectUseOfCFDI')) {
					queryAggregate.push(
						{
							$lookup: {
								from: 'uses-of-cfdis',
								let: { pid: '$defectUseOfCFDI' },
								pipeline: [
									{ $match: { $expr: { $and: [{ $eq: ['$_id', '$$pid'] }, { $ne: ['$operationType', 'D'] }] } } }
								],
								as: 'defectUseOfCFDI'
							}
						});
					queryAggregate.push({ $unwind: { path: "$defectUseOfCFDI", preserveNullAndEmptyArrays: true } });
				}

				if (searchPropertyOfArray(project, 'creationUser.')) {
					queryAggregate.push({ $lookup: { from: "users", foreignField: "_id", localField: "creationUser", as: "creationUser" } });
					queryAggregate.push({ $unwind: { path: "$creationUser", preserveNullAndEmptyArrays: true } });
				}

				if (searchPropertyOfArray(project, 'branch.')) {
					queryAggregate.push({ $lookup: { from: "branches", foreignField: "_id", localField: "branch", as: "branch" } });
					queryAggregate.push({ $unwind: { path: "$branch", preserveNullAndEmptyArrays: true } });
				}

				if (searchPropertyOfArray(project, 'updateUser.')) {
					queryAggregate.push({ $lookup: { from: "users", foreignField: "_id", localField: "updateUser", as: "updateUser" } });
					queryAggregate.push({ $unwind: { path: "$updateUser", preserveNullAndEmptyArrays: true } });
				}

				if (searchPropertyOfArray(project, 'defectEmailTemplate.')) {
					queryAggregate.push({ $lookup: { from: "email-templates", foreignField: "_id", localField: "defectEmailTemplate", as: "defectEmailTemplate" } });
					queryAggregate.push({ $unwind: { path: "$defectEmailTemplate", preserveNullAndEmptyArrays: true } });
				}

				if (searchPropertyOfArray(project, 'defectShipmentMethod.')) {
					queryAggregate.push({ $lookup: { from: "shipment-methods", foreignField: "_id", localField: "defectShipmentMethod", as: "defectShipmentMethod" } });
					queryAggregate.push({ $unwind: { path: "$defectShipmentMethod", preserveNullAndEmptyArrays: true } });
				}

				if (searchPropertyOfArray(project, 'application.')) {
					queryAggregate.push({ $lookup: { from: "applications", foreignField: "_id", localField: "application", as: "application" } });
					queryAggregate.push({ $unwind: { path: "$application", preserveNullAndEmptyArrays: true } });
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
						if (searchPropertyOfArray(JSON.parse(group), 'transactionTypes')) {
							projectGroup = `{ "transactionTypes": { "$slice": ["$transactionTypes", ${skip}, ${limit}] }`;
						} else {
							projectGroup = `{ "items": { "$slice": ["$items", ${skip}, ${limit}] }`;
						}
						for (let prop of Object.keys(JSON.parse(group))) {
							if (prop !== 'transactionTypes' && prop !== 'items') {
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

	TransactionType.aggregate(queryAggregate)
		.then(function (result) {
			fileController.writeLog(req, res, next, 200, result.length);
			if (result.length > 0) {
				if (group && group !== "{}" && group !== {}) {
					return res.status(200).send(result);
				} else {
					return res.status(200).send({ transactionTypes: result });
				}
			} else {
				if (group && group !== "{}" && group !== {}) {
					return res.status(200).send({ count: 0, transactionTypes: [] });
				} else {
					return res.status(200).send({ transactionTypes: [] });
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

function saveTransactionType(req, res, next) {

	initConnectionDB(req.session.database);

	let params = req.body;

	let transactionType = new TransactionType();
	transactionType.order = params.order;
	transactionType.transactionMovement = params.transactionMovement;
	transactionType.abbreviation = params.abbreviation;
	transactionType.name = params.name;
	transactionType.labelPrint = params.labelPrint;
	transactionType.abbreviation = params.abbreviation;
	transactionType.currentAccount = params.currentAccount;
	transactionType.movement = params.movement;
	transactionType.modifyStock = params.modifyStock;
	transactionType.stockMovement = params.stockMovement;
	transactionType.requestArticles = params.requestArticles;
	transactionType.modifyArticle = params.modifyArticle;
	transactionType.entryAmount = params.entryAmount;
	transactionType.requestTaxes = params.requestTaxes;
	transactionType.defectOrders = params.defectOrders;
	transactionType.allowAPP = params.allowAPP;
	transactionType.allowTransactionClose = params.allowTransactionClose;
	transactionType.allowEdit = params.allowEdit;
	transactionType.allowDelete = params.allowDelete;
	transactionType.allowZero = params.allowZero;
	transactionType.allowCompanyDiscount = params.allowCompanyDiscount;
	transactionType.electronics = params.electronics;
	transactionType.codes = params.codes;
	transactionType.fiscalCode = params.fiscalCode;
	transactionType.fixedOrigin = params.fixedOrigin;
	transactionType.fixedLetter = params.fixedLetter;
	transactionType.maxOrderNumber = params.maxOrderNumber;
	transactionType.printable = params.printable;
	transactionType.defectPrinter = params.defectPrinter;
	transactionType.defectUseOfCFDI = params.defectUseOfCFDI;
	transactionType.tax = params.tax;
	transactionType.cashBoxImpact = params.cashBoxImpact;
	transactionType.cashOpening = params.cashOpening;
	transactionType.cashClosing = params.cashClosing;
	transactionType.requestPaymentMethods = params.requestPaymentMethods;
	transactionType.showPrices = params.showPrices;
	transactionType.requestEmployee = params.requestEmployee;
	transactionType.requestCurrency = params.requestCurrency;
	transactionType.fastPayment = params.fastPayment;
	transactionType.requestCompany = params.requestCompany;
	transactionType.requestTransport = params.requestTransport;
	transactionType.isPreprinted = params.isPreprinted;
	transactionType.showPriceType = params.showPriceType;
	transactionType.showDescriptionType = params.showDescriptionType;
	transactionType.printDescriptionType = params.printDescriptionType;
	transactionType.printSign = params.printSign;
	transactionType.posKitchen = params.posKitchen;
	transactionType.automaticNumbering = params.automaticNumbering;
	transactionType.automaticCreation = params.automaticCreation;
	transactionType.readLayout = params.readLayout;
	transactionType.updatePrice = params.updatePrice;
	transactionType.updateArticle = params.updateArticle;
	transactionType.expirationDate = params.expirationDate;
	transactionType.finishCharge = params.finishCharge;
	transactionType.branch = params.branch;
	transactionType.level = params.level;
	transactionType.requestShipmentMethod = params.requestShipmentMethod;
	transactionType.defectShipmentMethod = params.defectShipmentMethod;
    transactionType.application = transactionType.application;
    transactionType.groupsArticles = transactionType.groupsArticles;
    transactionType.numberPrint = transactionType.numberPrint;
    transactionType.optionalAFIP = transactionType.optionalAFIP;

	let user = new User();
	user._id = req.session.user;
	transactionType.creationUser = user;
	transactionType.creationDate = moment().format('YYYY-MM-DDTHH:mm:ssZ');
	transactionType.operationType = 'C';

	if (transactionType.name) {

		let json = '{"$and":[{"operationType": {"$ne": "D"}},';
		json = json + '{"name": "' + transactionType.name + '"},';
		json = json + '{"transactionMovement": "' + transactionType.transactionMovement + '"}]}';
		let where;
		try {
			where = JSON.parse(json);
		} catch (err) {
			fileController.writeLog(req, res, next, 500, json);
			fileController.writeLog(req, res, next, 500, err);
			return res.status(500).send(constants.ERR_SERVER);
		}

		TransactionType.find(where).exec(async (err, transactionTypes) => {

			if (err) {
				fileController.writeLog(req, res, next, 500, err);
				return res.status(500).send(constants.ERR_SERVER);
			} else {
				if (!transactionTypes || transactionTypes.length === 0) {
					transactionType.save((err, transactionTypeSaved) => {
						if (err) {
							fileController.writeLog(req, res, next, 500, err);
							return res.status(500).send(constants.ERR_SERVER);
						} else {
							getTransactionType(req, res, next, transactionTypeSaved._id);
						}
					});
				} else {
					let message = 'El tipo de transacción \"' + transactionType.name + '\" ya existe';
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

function updateTransactionType(req, res, next) {

	initConnectionDB(req.session.database);
	let transactionTypeId = req.query.id;
	let transactionType = req.body;

	let user = new User();
	user._id = req.session.user;
	transactionType.updateUser = user;
	transactionType.updateDate = moment().format('YYYY-MM-DDTHH:mm:ssZ');
	transactionType.operationType = 'U';

	if (transactionType.name) {

		let json = '{"$and":[{"operationType": {"$ne": "D"}},';
		json = json + '{"name": "' + transactionType.name + '"},';
		json = json + '{"transactionMovement": "' + transactionType.transactionMovement + '"},';
		json = json + '{"_id": {"$ne": "' + transactionTypeId + '"}}]}';
		let where;
		try {
			where = JSON.parse(json);
		} catch (err) {
			fileController.writeLog(req, res, next, 500, json);
			fileController.writeLog(req, res, next, 500, err);
			return res.status(500).send(constants.ERR_SERVER);
		}

		TransactionType.find(where).exec((err, transactionTypes) => {
			if (err) {
				fileController.writeLog(req, res, next, 500, err);
				return res.status(500).send(constants.ERR_SERVER);
			} else {
				if (!transactionTypes || transactionTypes.length === 0) {
					TransactionType.findByIdAndUpdate(transactionTypeId, transactionType, (err, transactionTypeUpdated) => {
						if (err) {
							fileController.writeLog(req, res, next, 500, err);
							return res.status(500).send(constants.ERR_SERVER);
						} else {
							getTransactionType(req, res, next, transactionTypeUpdated._id);
						}
					});
				} else {
					let message = 'El tipo de transacción \"' + transactionType.name + '\" ya existe';
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

function deleteTransactionType(req, res, next) {

	initConnectionDB(req.session.database);

	let transactionTypeId = req.query.id;

	let user = new User();
	user._id = req.session.user;

	TransactionType.findByIdAndUpdate(transactionTypeId,
		{
			$set: {
				updateUser: user,
				updateDate: moment().format('YYYY-MM-DDTHH:mm:ssZ'),
				operationType: 'D'
			}
		}, (err, transactionTypeUpdated) => {
			if (err) {
				fileController.writeLog(req, res, next, 500, err);
				return res.status(500).send(constants.ERR_SERVER);
			} else {
				fileController.writeLog(req, res, next, 200, transactionTypeUpdated._id);
				return res.status(200).send({ transactionType: transactionTypeUpdated });
			}
		});
}

function initConnectionDB(database) {

	const Model = require('./../models/model');

	let TransactionTypeSchema = require('./../models/transaction-type');
	TransactionType = new Model('transaction-type', {
		schema: TransactionTypeSchema,
		connection: database
	});

	let PrinterSchema = require('./../models/printer');
	Printer = new Model('printer', {
		schema: PrinterSchema,
		connection: database
	});

	let EmployeeTypeSchema = require('./../models/employee-type');
	EmployeeType = new Model('employee-type', {
		schema: EmployeeTypeSchema,
		connection: database
	});

	let PaymentMethodSchema = require('./../models/payment-method');
	PaymentMethod = new Model('payment-method', {
		schema: PaymentMethodSchema,
		connection: database
	});

	let UserSchema = require('./../models/user');
	User = new Model('user', {
		schema: UserSchema,
		connection: database
	});

	let UseOfCFDISchema = require('./../models/use-of-CFDI');
	UseOfCFDI = new Model('uses-of-cfdi', {
		schema: UseOfCFDISchema,
		connection: database
	});

	let EmailTemplateSchema = require('./../models/email-template');
	EmailTemplate = new Model('email-template', {
		schema: EmailTemplateSchema,
		connection: database
	});

	let ShipmentMethodSchema = require('./../models/shipment-method');
	ShipmentMethod = new Model('shipment-method', {
		schema: ShipmentMethodSchema,
		connection: database
	});

	let BranchSchema = require('./../models/branch');
	Branch = new Model('branch', {
		schema: BranchSchema,
		connection: database
	});

	let ApplicationSchema = require('./../models/application');
	Application = new Model('application', {
		schema: ApplicationSchema,
		connection: database
	});
}

module.exports = {
	getTransactionType,
	getTransactionTypes,
	getTransactionTypesV2,
	saveTransactionType,
	updateTransactionType,
	deleteTransactionType,
	getAsync
}