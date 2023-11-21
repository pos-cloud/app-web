'use strict'

let fileController = require('./file.controller');
let constants = require('../utilities/constants');
const { EJSON } = require('bson');
let moment = require('moment');
moment.locale('es');

let User;
let CurrencyValue;

// AWAIT
function get(req, res, next, id = undefined) {

	return new Promise((resolve, reject) => {

		initConnectionDB(req.session.database);

		let currencyValueId;
		if (id) {
			currencyValueId = id;
		} else {
			currencyValueId = req.query.id;
		}

		CurrencyValue.findById(currencyValueId, (err, currencyValue) => {
			if (err) {
				reject(err);
			} else {
				if (!currencyValue) {
					reject(constants.NO_DATA_FOUND);
				} else {
					resolve(currencyValue);
				}
			}
		});
	});
}

// SIN AWAIT
function getCurrencyValue(req, res, next, id = undefined) {

	initConnectionDB(req.session.database);

	let currencyValueId;
	if (id) {
		currencyValueId = id;
	} else {
		currencyValueId = req.query.id;
	}

	CurrencyValue.findById(currencyValueId, (err, currencyValue) => {
		if (err) {
			fileController.writeLog(req, res, next, 500, err);
			return res.status(500).send(constants.ERR_SERVER);
		} else if (!currencyValue) {
			fileController.writeLog(req, res, next, 404, constants.NO_DATA_FOUND);
			return res.status(404).send(constants.NO_DATA_FOUND);
		} else {
			fileController.writeLog(req, res, next, 200, currencyValue);
			return res.status(200).send({ currencyValue: currencyValue });

		}
	});
}

function getCurrencyValues(req, res, next) {

	//http://localhost:3000/api/currencyValues/limit=6&skip=0&select=name,code&sort="code":1&where="name":"s"

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

	CurrencyValue.find(where).
		limit(limit).
		select(select).
		sort(sort).
		skip(skip).
		exec((err, currencyValues) => {
			if (err) {
				fileController.writeLog(req, res, next, 500, err);
				return res.status(500).send(constants.ERR_SERVER);
			} else {
				if (!currencyValues) {
					fileController.writeLog(req, res, next, 404, constants.NO_DATA_FOUND);
					return res.status(404).send(constants.NO_DATA_FOUND);
				} else if (currencyValues.length === 0) {
					fileController.writeLog(req, res, next, 200, constants.NO_DATA_FOUND);
					return res.status(200).send({ message: constants.NO_DATA_FOUND });
				} else if (!currencyValues) {
					fileController.writeLog(req, res, next, 404, constants.NO_DATA_FOUND);
					return res.status(404).send(constants.NO_DATA_FOUND);
				} else {
					fileController.writeLog(req, res, next, 200, currencyValues.length);
					return res.status(200).send({ currencyValues: currencyValues });

				}
			}
		});
}

function getCurrencyValuesV2(req, res, next) {

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
						if (searchPropertyOfArray(JSON.parse(group), 'currencyValues')) {
							projectGroup = `{ "currencyValues": { "$slice": ["$currencyValues", ${skip}, ${limit}] }`;
						} else {
							projectGroup = `{ "items": { "$slice": ["$items", ${skip}, ${limit}] }`;
						}
						for (let prop of Object.keys(JSON.parse(group))) {
							if (prop !== 'currencyValues' && prop !== 'items') {
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

	CurrencyValue.aggregate(queryAggregate)
		.then(function (result) {
			fileController.writeLog(req, res, next, 200, result.length);
			if (result.length > 0) {
				if (group && group !== "{}" && group !== {}) {
					return res.status(200).send(result);
				} else {
					return res.status(200).send({ currencyValues: result });
				}
			} else {
				if (group && group !== "{}" && group !== {}) {
					return res.status(200).send({ count: 0, currencyValues: [] });
				} else {
					return res.status(200).send({ currencyValues: [] });
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

function saveCurrencyValue(req, res, next) {

	initConnectionDB(req.session.database);

	let currencyValue = new CurrencyValue();
	let params = req.body;

	currencyValue.name = params.name;
	currencyValue.value = params.value;

	let user = new User();
	user._id = req.session.user;
	currencyValue.creationUser = user;
	currencyValue.operationType = 'C';


	if (currencyValue.name && currencyValue.value) {


		let json = '{"$and":[{"operationType": {"$ne": "D"}},';
		json = json + '{"$and":[{"name": "' + currencyValue.name + '"},';
		json = json + '{"value": ' + currencyValue.value + '}]}]}';

		let where;
		try {
			where = JSON.parse(json);
		} catch (err) {
			fileController.writeLog(req, res, next, 500, json);
			fileController.writeLog(req, res, next, 500, err);
			return res.status(500).send(constants.ERR_SERVER);
		}

		CurrencyValue.find(where).exec((err, currencyValues) => {
			if (err) {
				fileController.writeLog(req, res, next, 500, err);
				return res.status(500).send(constants.ERR_SERVER);
			} else {
				if (!currencyValues || currencyValues.length === 0) {
					currencyValue.save((err, currencyValueSave) => {
						if (err) {
							fileController.writeLog(req, res, next, 500, err);
							return res.status(500).send(constants.ERR_SERVER);
						} else {
							getCurrencyValue(req, res, next, currencyValueSave._id);
						}
					});
				} else {
					let message = 'El tipo \"' + currencyValue.name + '\" ya existe ';
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

function updateCurrencyValue(req, res, next) {

	initConnectionDB(req.session.database);

	let currencyValueId = req.query.id;
	let currencyValue = req.body;

	let user = new User();
	user._id = req.session.user;
	currencyValue.updateUser = user;
	currencyValue.operationType = 'U';

	if (currencyValue.name && currencyValue.value) {


		let json = '{"$and":[{"operationType": {"$ne": "D"}},';
		json = json + '{"$and":[{"name": "' + currencyValue.name + '"},';
		json = json + '{"_id": {"$ne": "' + currencyValueId + '"}},';
		json = json + '{"value": ' + currencyValue.value + '}]}]}';

		let where;
		try {
			where = JSON.parse(json);
		} catch (err) {
			fileController.writeLog(req, res, next, 500, json);
			fileController.writeLog(req, res, next, 500, err);
			return res.status(500).send(constants.ERR_SERVER);
		}

		CurrencyValue.find(where).exec((err, currencyValues) => {
			if (err) {
				fileController.writeLog(req, res, next, 500, err);
				return res.status(500).send(constants.ERR_SERVER);
			} else {
				if (!currencyValues || currencyValues.length === 0) {
					CurrencyValue.findByIdAndUpdate(currencyValueId, currencyValue, (err, currencyValueUpdated) => {
						if (err) {
							fileController.writeLog(req, res, next, 500, err);
							return res.status(500).send(constants.ERR_SERVER);
						} else {
							getCurrencyValue(req, res, next, currencyValueUpdated._id);
						}
					});
				} else {
					let message = 'El tipo de moneda \"' + currencyValue.name + '\" ya existe';
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

function deleteCurrencyValue(req, res, next) {

	initConnectionDB(req.session.database);

	let currencyValueId = req.query.id;

	let user = new User();
	user._id = req.session.user;

	CurrencyValue.findByIdAndUpdate(currencyValueId,
		{
			$set: {
				updateUser: user,
				updateDate: moment().format('YYYY-MM-DDTHH:mm:ssZ'),
				operationType: 'D'
			}
		}, (err, currencyValueUpdated) => {
			if (err) {
				fileController.writeLog(req, res, next, 500, err);
				return res.status(500).send(constants.ERR_SERVER);
			} else {
				fileController.writeLog(req, res, next, 200, "CurrencyValue " + currencyValueUpdated);
				return res.status(200).send({ currencyValue: currencyValueUpdated });
			}
		});
}

function initConnectionDB(database) {

	const Model = require('../models/model');

	let CurrencyValueSchema = require('./../models/currency-value');
	CurrencyValue = new Model('currency-value', {
		schema: CurrencyValueSchema,
		connection: database
	});

	let UserSchema = require('../models/user');
	User = new Model('user', {
		schema: UserSchema,
		connection: database
	});
}

module.exports = {
	get,
	getCurrencyValue,
	getCurrencyValues,
	getCurrencyValuesV2,
	saveCurrencyValue,
	updateCurrencyValue,
	deleteCurrencyValue
}