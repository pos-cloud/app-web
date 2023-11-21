'use strict'

let fileController = require('./file.controller');
let constants = require('./../utilities/constants');
const { EJSON } = require('bson');
let moment = require('moment');
moment.locale('es');

let User;
let Tax;
let Account;
let Printer;

function getTax(req, res, next, id = undefined) {

	initConnectionDB(req.session.database);

	let taxId;
	if (id) {
		taxId = id;
	} else {
		taxId = req.query.id;
	}

	Tax.findById(taxId, (err, tax) => {
		if (err) {
			fileController.writeLog(req, res, next, 500, err);
			return res.status(500).send(constants.ERR_SERVER);
		} else {
			if (!tax || tax.operationType == 'D') {
				fileController.writeLog(req, res, next, 404, constants.NO_DATA_FOUND);
				return res.status(404).send(constants.NO_DATA_FOUND);
			} else {
				fileController.writeLog(req, res, next, 200, tax);
				return res.status(200).send({ tax: tax });
			}
		}
	}).populate({
		path: 'debitAccount',
		model: Account
	}).populate({
		path: 'creditAccount',
		model: Account
	}).populate({
		path: 'printer',
		model: Printer
	});
}

function getTaxes(req, res, next) {

	//http://localhost:3000/api/taxes/limit=6&skip=0&select=name,code&sort="code":1&where="name":"s"

	initConnectionDB(req.session.database);

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

	Tax.find(where).
		limit(limit).
		select(select).
		sort(sort).
		skip(skip).
		exec((err, taxes) => {
			if (err) {
				fileController.writeLog(req, res, next, 500, err);
				return res.status(500).send(constants.ERR_SERVER);
			} else {
				if (!taxes) {
					fileController.writeLog(req, res, next, 404, constants.NO_DATA_FOUND);
					return res.status(404).send(constants.NO_DATA_FOUND);
				} else if (taxes.length === 0) {
					fileController.writeLog(req, res, next, 200, constants.NO_DATA_FOUND);
					return res.status(200).send({ message: constants.NO_DATA_FOUND });
				} else {
					fileController.writeLog(req, res, next, 200, 'Tax ' + taxes.length);
					return res.status(200).send({ taxes: taxes });
				}
			}
		});
}

function getTaxesV2(req, res, next) {

	initConnectionDB(req.session.database);

	let queryAggregate = [];
	let group;

	if (req.query && req.query !== {}) {

		let error;

		let project = req.query.project;
		if (project && project !== {} && project !== "{}") {
			try {
				project = JSON.parse(project);

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
						if (searchPropertyOfArray(JSON.parse(group), 'taxes')) {
							projectGroup = `{ "taxes": { "$slice": ["$taxes", ${skip}, ${limit}] }`;
						} else {
							projectGroup = `{ "items": { "$slice": ["$items", ${skip}, ${limit}] }`;
						}
						for (let prop of Object.keys(JSON.parse(group))) {
							if (prop !== 'taxes' && prop !== 'items') {
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

	Tax.aggregate(queryAggregate)
		.then(function (result) {
			fileController.writeLog(req, res, next, 200, result.length);
			if (result.length > 0) {
				if (group && group !== "{}" && group !== {}) {
					return res.status(200).send(result);
				} else {
					return res.status(200).send({ taxes: result });
				}
			} else {
				if (group && group !== "{}" && group !== {}) {
					return res.status(200).send({ count: 0, taxes: [] });
				} else {
					return res.status(200).send({ taxes: [] });
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

function saveTax(req, res, next) {

	initConnectionDB(req.session.database);

	let tax = new Tax();
	let params = req.body;

	tax.code = params.code;
	tax.name = params.name;
	tax.taxBase = params.taxBase;
	tax.percentage = params.percentage;
	tax.amount = params.amount;
	tax.classification = params.classification;
	tax.type = params.type;
	tax.lastNumber = params.lastNumber;
    tax.debitAccount = params.debitAccount;
    tax.creditAccount = params.creditAccount;
    tax.printer = params.printer;

	let user = new User();
	user._id = req.session.user;
	tax.creationUser = user;
	tax.creationDate = moment().format('YYYY-MM-DDTHH:mm:ssZ');
	tax.operationType = 'C';

	if (tax.code &&
		tax.classification &&
		tax.name) {

		let json = '{"$and":[{"operationType": {"$ne": "D"}},';
		json = json + '{"classification": "' + tax.classification + '"},';
		json = json + '{"$or":[{"code": "' + tax.code + '"},';
		json = json + '{"name": "' + tax.name + '"}]}]}';
		let where;
		try {
			where = JSON.parse(json);
		} catch (err) {
			fileController.writeLog(req, res, next, 500, json);
			fileController.writeLog(req, res, next, 500, err);
			return res.status(500).send(constants.ERR_SERVER);
		}

		Tax.find(where).exec((err, taxes) => {
			if (err) {
				fileController.writeLog(req, res, next, 500, err);
				return res.status(500).send(constants.ERR_SERVER);
			} else {
				if (!taxes || taxes.length === 0) {
					tax.save((err, taxSaved) => {
						if (err) {
							fileController.writeLog(req, res, next, 500, err);
							return res.status(500).send(constants.ERR_SERVER);
						} else {
							getTax(req, res, next, taxSaved._id);
						}
					});
				} else {
					let message = 'El impuesto ya existe';
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

function updateTax(req, res, next) {

	initConnectionDB(req.session.database);

	let taxId = req.query.id;
	let tax = req.body;

	let user = new User();
	user._id = req.session.user;
	tax.updateUser = user;
	tax.updateDate = moment().format('YYYY-MM-DDTHH:mm:ssZ');
	tax.operationType = 'U';

	if (tax.code &&
		tax.classification &&
		tax.name) {
		let json = '{"$and":[{"operationType": {"$ne": "D"}},';
		json = json + '{"classification": "' + tax.classification + '"},';
		json = json + '{"$or":[{"code": "' + tax.code + '"},';
		json = json + '{"name": "' + tax.name + '"}]},';
		json = json + '{"_id": {"$ne": "' + taxId + '"}}]}';
		let where;
		try {
			where = JSON.parse(json);
		} catch (err) {
			fileController.writeLog(req, res, next, 500, json);
			fileController.writeLog(req, res, next, 500, err);
			return res.status(500).send(constants.ERR_SERVER);
		}

		Tax.find(where).exec((err, taxes) => {
			if (err) {
				fileController.writeLog(req, res, next, 500, err);
				return res.status(500).send(constants.ERR_SERVER);
			} else {
				if (!taxes || taxes.length === 0) {
					Tax.findByIdAndUpdate(taxId, tax, (err, taxUpdated) => {
						if (err) {
							fileController.writeLog(req, res, next, 500, err);
							return res.status(500).send(constants.ERR_SERVER);
						} else {
							getTax(req, res, next, taxUpdated._id);
						}
					});
				} else {
					let message = 'El impuesto ya existe';
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

function deleteTax(req, res, next) {

	initConnectionDB(req.session.database);

	let taxId = req.query.id;

	let user = new User();
	user._id = req.session.user;

	Tax.findByIdAndUpdate(taxId,
		{
			$set: {
				updateUser: user,
				updateDate: moment().format('YYYY-MM-DDTHH:mm:ssZ'),
				operationType: 'D'
			}
		}, (err, taxUpdated) => {
			if (err) {
				fileController.writeLog(req, res, next, 500, err);
				return res.status(500).send(constants.ERR_SERVER);
			} else {
				fileController.writeLog(req, res, next, 200, "Tax " + taxUpdated);
				return res.status(200).send({ tax: taxUpdated });
			}
		});
}

function initConnectionDB(database) {

	const Model = require('./../models/model');

	let TaxSchema = require('./../models/tax');
	Tax = new Model('tax', {
		schema: TaxSchema,
		connection: database
	});

	let UserSchema = require('./../models/user');
	User = new Model('user', {
		schema: UserSchema,
		connection: database
	});

    let AccountSchema = require('./../models/account');
	Account = new Model('account', {
		schema: AccountSchema,
		connection: database
	});

    let PrinterSchema = require('./../models/printer');
	Printer = new Model('printer', {
		schema: PrinterSchema,
		connection: database
	});
}

module.exports = {
	getTax,
	getTaxes,
	getTaxesV2,
	saveTax,
	updateTax,
	deleteTax
}