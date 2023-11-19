'use strict'

let fileController = require('./file.controller');
let constants = require('../utilities/constants');
const { EJSON } = require('bson');
let moment = require('moment');
moment.locale('es');

let Bank;
let User;
let Account;

function getBank(req, res, next, id = undefined) {

	initConnectionDB(req.session.database);

	let bankId;
	if (id) {
		bankId = id;
	} else {
		bankId = req.query.id;
	}

	Bank.findById(bankId, (err, bank) => {
		if (err) {
			fileController.writeLog(req, res, next, 500, err);
			return res.status(500).send(err);
		} else {
			if (!bank || bank.operationType == 'D') {
				fileController.writeLog(req, res, next, 404, constants.NO_DATA_FOUND);
				return res.status(404).send(constants.NO_DATA_FOUND);
			} else {
				fileController.writeLog(req, res, next, 200, bank);
				return res.status(200).send({ bank: bank });
			}
		}
	})
		.populate({
			path: 'creationUser',
			model: User
		})
        .populate({
			path: 'account',
			model: Account
		})
		.populate({
			path: 'updateUser',
			model: User
		})
}

function getBanks(req, res, next) {

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
						if (searchPropertyOfArray(JSON.parse(group), 'banks')) {
							projectGroup = `{ "banks": { "$slice": ["$banks", ${skip}, ${limit}] }`;
						} else {
							projectGroup = `{ "items": { "$slice": ["$items", ${skip}, ${limit}] }`;
						}
						for (let prop of Object.keys(JSON.parse(group))) {
							if (prop !== 'banks' && prop !== 'items') {
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

	Bank.aggregate(queryAggregate)
		.then(function (result) {
			fileController.writeLog(req, res, next, 200, result.length);
			if (result.length > 0) {
				if (group && group !== "{}" && group !== {}) {
					return res.status(200).send(result);
				} else {
					return res.status(200).send({ banks: result });
				}
			} else {
				if (group && group !== "{}" && group !== {}) {
					return res.status(200).send({ count: 0, banks: [] });
				} else {
					return res.status(200).send({ banks: [] });
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

function saveBank(req, res, next) {

	initConnectionDB(req.session.database);

	let bank = new Bank();
	let params = req.body;

	bank.code = params.code;
	bank.agency = params.agency;
	bank.account = params.account;
	bank.name = params.name;

	let user = new User();
	user._id = req.session.user;
	bank.creationUser = user;
	bank.creationDate = moment().format('YYYY-MM-DDTHH:mm:ssZ');
	bank.operationType = 'C';


	if (bank.code &&
		bank.agency) {

		let json = '{"$and":[{"operationType": {"$ne": "D"}},';
		json = json + '{"$and":[{"code": "' + bank.code + '"},';
		json = json + '{"agency": "' + bank.agency + '"}]}]}';

		let where;
		try {
			where = JSON.parse(json);
		} catch (err) {
			fileController.writeLog(req, res, next, 500, json);
			fileController.writeLog(req, res, next, 500, err);
			return res.status(500).send(constants.ERR_SERVER);
		}

		Bank.find(where).exec((err, banks) => {
			if (err) {
				fileController.writeLog(req, res, next, 500, err);
				return res.status(500).send(constants.ERR_SERVER);
			} else {
				if (!banks || banks.length === 0) {
					bank.save((err, bankSave) => {
						if (err) {
							fileController.writeLog(req, res, next, 500, err);
							return res.status(500).send(err);
						} else {
							fileController.writeLog(req, res, next, 200, bankSave._id);
							getBank(req, res, next, bankSave._id);
						}
					});
				} else {
					let message = 'El banco ya existe';
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

function updateBank(req, res, next) {

	initConnectionDB(req.session.database);

	let bankId = req.query.id;
	let bank = req.body;

	let user = new User();
	user._id = req.session.user;
	bank.updateUser = user;
	bank.updateDate = moment().format('YYYY-MM-DDTHH:mm:ssZ');
	bank.operationType = 'U';


	if (bank.code &&
		bank.agency) {

		let json = '{"$and":[{"operationType": {"$ne": "D"}},';
		json = json + '{"$and":[{"code": "' + bank.code + '"},';
		json = json + '{"agency": "' + bank.agency + '"}]},';
		json = json + '{"_id": {"$ne": "' + bankId + '"}}]}';

		let where;
		try {
			where = JSON.parse(json);
		} catch (err) {
			fileController.writeLog(req, res, next, 500, json);
			fileController.writeLog(req, res, next, 500, err);
			return res.status(500).send(constants.ERR_SERVER);
		}

		Bank.find(where).exec((err, banks) => {
			if (err) {
				fileController.writeLog(req, res, next, 500, err);
				return res.status(500).send(constants.ERR_SERVER);
			} else {
				if (!banks || banks.length === 0) {
					Bank.findByIdAndUpdate(bankId, bank, (err, bankUpdated) => {
						if (err) {
							fileController.writeLog(req, res, next, 500, err);
							return res.status(500).send(err);
						} else {
							fileController.writeLog(req, res, next, 200, bankUpdated._id);
							getBank(req, res, next, bankUpdated._id);
						}
					});
				} else {
					let message = 'El banco ya existe';
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

function deleteBank(req, res, next) {

	initConnectionDB(req.session.database);

	let bankId = req.query.id;

	let user = new User();
	user._id = req.session.user;

	Bank.findByIdAndUpdate(bankId,
		{
			$set: {
				updateUser: user,
				updateDate: moment().format('YYYY-MM-DDTHH:mm:ssZ'),
				operationType: 'D'
			}
		}, (err, bankDelete) => {
			if (err) {
				fileController.writeLog(req, res, next, 500, err);
				return res.status(500).send(constants.ERR_SERVER);
			} else {
				fileController.writeLog(req, res, next, 200, bankDelete._id);
				return res.status(200).send({ bank: bankDelete });
			}
		});
}

function initConnectionDB(database) {

	const Model = require('../models/model');

	let BankSchema = require('./../models/bank');
	Bank = new Model('bank', {
		schema: BankSchema,
		connection: database
	});

	let UserSchema = require('../models/user');
	User = new Model('user', {
		schema: UserSchema,
		connection: database
	});

    let AccountSchema = require('./../models/account');
	Account = new Model('account', {
		schema: AccountSchema,
		connection: database
	});
}

module.exports = {
	getBank,
	getBanks,
	saveBank,
	updateBank,
	deleteBank
}