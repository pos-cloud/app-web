'use strict'

let fileController = require('./file.controller');
let constants = require('./../utilities/constants');
const { EJSON } = require('bson');
let moment = require('moment');
moment.locale('es');

let CashBoxType;
let User;

function getCashBoxType(req, res, next, id = undefined) {

	initConnectionDB(req.session.database);

	let cashBoxTypeId;
	if (id) {
		cashBoxTypeId = id;
	} else {
		cashBoxTypeId = req.query.id;
	}

	CashBoxType.findById(cashBoxTypeId, (err, cashBoxType) => {
		if (err) {
			fileController.writeLog(req, res, next, 500, err);
			return res.status(500).send(constants.ERR_SERVER);
		} else {
			if (!cashBoxType || cashBoxType.operationType == "D") {
				fileController.writeLog(req, res, next, 404, constants.NO_DATA_FOUND);
				return res.status(404).send(constants.NO_DATA_FOUND);
			} else {
				fileController.writeLog(req, res, next, 200, cashBoxType);
				return res.status(200).send({ cashBoxType: cashBoxType });
			}

		}
	});
}

function getCashBoxTypes(req, res, next) {

	//http://localhost:3000/api/articles/limit=6&skip=0&select=description,code&sort="code":1&where="description":"s"

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
					json += "{" + item[1] + "}]}";
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

	CashBoxType.find(where).
		limit(limit).
		select(select).
		sort(sort).
		skip(skip).
		exec((err, cashBoxTypes) => {
			if (err) {
				fileController.writeLog(req, res, next, 500, err);
				return res.status(500).send(constants.ERR_SERVER);
			} else {
				if (!cashBoxTypes) {
					fileController.writeLog(req, res, next, 404, constants.NO_DATA_FOUND);
					return res.status(404).send(constants.NO_DATA_FOUND);
				} else if (cashBoxTypes.length === 0) {
					fileController.writeLog(req, res, next, 200, constants.NO_DATA_FOUND);
					return res.status(200).send({ message: constants.NO_DATA_FOUND });
				} else {
					if (cashBoxTypes) {
						fileController.writeLog(req, res, next, 200, cashBoxTypes.length);
					}
					return res.status(200).send({ cashBoxTypes: cashBoxTypes });
				}
			}
		});
}

function getCashBoxTypesV2(req, res, next) {

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
						if (searchPropertyOfArray(JSON.parse(group), 'cashBoxTypes')) {
							projectGroup = `{ "cashBoxTypes": { "$slice": ["$cashBoxTypes", ${skip}, ${limit}] }`;
						} else {
							projectGroup = `{ "items": { "$slice": ["$items", ${skip}, ${limit}] }`;
						}
						for (let prop of Object.keys(JSON.parse(group))) {
							if (prop !== 'cashBoxTypes' && prop !== 'items') {
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

	CashBoxType.aggregate(queryAggregate)
		.then(function (result) {
			fileController.writeLog(req, res, next, 200, result.length);
			if (result.length > 0) {
				if (group && group !== "{}" && group !== {}) {
					return res.status(200).send(result);
				} else {
					return res.status(200).send({ cashBoxTypes: result });
				}
			} else {
				if (group && group !== "{}" && group !== {}) {
					return res.status(200).send({ count: 0, cashBoxTypes: [] });
				} else {
					return res.status(200).send({ cashBoxTypes: [] });
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

function saveCashBoxType(req, res, next) {

	initConnectionDB(req.session.database);

	let cashBoxType = new CashBoxType();
	let params = req.body;

	cashBoxType.name = params.name;

	let user = new User();
	user._id = req.session.user;
	cashBoxType.creationUser = user;
	cashBoxType.creationDate = moment().format('YYYY-MM-DDTHH:mm:ssZ');
	cashBoxType.operationType = 'C';

	if (cashBoxType.name) {

		let json = '{"$and":[{"operationType": {"$ne": "D"}},';
		json = json + '{"name": "' + cashBoxType.name + '"}]}';
		let where;
		try {
			where = JSON.parse(json);
		} catch (err) {
			fileController.writeLog(req, res, next, 500, json);
			fileController.writeLog(req, res, next, 500, err);
			return res.status(500).send(constants.ERR_SERVER);
		}

		CashBoxType.find(where).exec((err, cashBoxTypes) => {
			if (err) {
				fileController.writeLog(req, res, next, 500, err);
				return res.status(500).send(constants.ERR_SERVER);
			} else {
				if (!cashBoxTypes || cashBoxTypes.length === 0) {
					cashBoxType.save((err, cashBoxTypeSaved) => {
						if (err) {
							fileController.writeLog(req, res, next, 500, err);
							return res.status(500).send(constants.ERR_SERVER);
						} else {
							getCashBoxType(req, res, next, cashBoxTypeSaved._id);
						}
					});
				} else {
					let message = 'El tipo de caja \"' + cashBoxType.name + '\" ya existe';
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

function updateCashBoxType(req, res, next) {

	initConnectionDB(req.session.database);

	let cashBoxTypeId = req.query.id;
	let cashBoxType = req.body;

	let user = new User();
	user._id = req.session.user;
	cashBoxType.updateUser = user;
	cashBoxType.updateDate = moment().format('YYYY-MM-DDTHH:mm:ssZ');
	cashBoxType.operationType = 'U';

	if (cashBoxType.name) {

		let json = '{"$and":[{"operationType": {"$ne": "D"}},';
		json = json + '{"name": "' + cashBoxType.name + '"},';
		json = json + '{"_id": {"$ne": "' + cashBoxTypeId + '"}}]}';
		let where;
		try {
			where = JSON.parse(json);
		} catch (err) {
			fileController.writeLog(req, res, next, 500, json);
			fileController.writeLog(req, res, next, 500, err);
			return res.status(500).send(constants.ERR_SERVER);
		}

		CashBoxType.find(where).exec((err, cashBoxTypes) => {
			if (err) {
				fileController.writeLog(req, res, next, 500, err);
				return res.status(500).send(constants.ERR_SERVER);
			} else {
				if (!cashBoxTypes || cashBoxTypes.length === 0) {
					CashBoxType.findByIdAndUpdate(cashBoxTypeId, cashBoxType, (err, cashBoxTypeUpdated) => {
						if (err) {
							fileController.writeLog(req, res, next, 500, err);
							return res.status(500).send(constants.ERR_SERVER);
						} else {
							getCashBoxType(req, res, next, cashBoxTypeUpdated._id);
						}
					});
				} else {
					let message = 'El tipo de caja \"' + cashBoxType.name + '\" ya existe';
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

function deleteCashBoxType(req, res, next) {

	initConnectionDB(req.session.database);

	let cashBoxTypeId = req.query.id;

	let user = new User();
	user._id = req.session.user;

	CashBoxType.findByIdAndUpdate(cashBoxTypeId,
		{
			$set: {
				updateUser: user,
				updateDate: moment().format('YYYY-MM-DDTHH:mm:ssZ'),
				operationType: 'D'
			}
		}, (err, cashBoxTypeUpdated) => {
			if (err) {
				fileController.writeLog(req, res, next, 500, err);
				return res.status(500).send(constants.ERR_SERVER);
			} else {
				fileController.writeLog(req, res, next, 200, cashBoxTypeUpdated._id);
				return res.status(200).send({ cashBoxType: cashBoxTypeUpdated });
			}
		});
}

function initConnectionDB(database) {

	const Model = require('./../models/model');

	let CashBoxTypeSchema = require('./../models/cash-box-type');
	CashBoxType = new Model('cash-box-type', {
		schema: CashBoxTypeSchema,
		connection: database
	});

	let UserSchema = require('./../models/user');
	User = new Model('user', {
		schema: UserSchema,
		connection: database
	});
}

module.exports = {
	getCashBoxType,
	getCashBoxTypes,
	getCashBoxTypesV2,
	saveCashBoxType,
	updateCashBoxType,
	deleteCashBoxType
}