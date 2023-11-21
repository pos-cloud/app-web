'use strict'

let fileController = require('./file.controller');
let constants = require('./../utilities/constants');
const { EJSON } = require('bson');
let moment = require('moment');
moment.locale('es');

let VATCondition;
let User;

function getVATCondition(req, res, next, id = undefined) {

	initConnectionDB(req.session.database);

	let vatConditionId;
	if (id) {
		vatConditionId = id;
	} else {
		vatConditionId = req.query.id;
	}

	VATCondition.findById(vatConditionId, (err, vatCondition) => {
		if (err) {
			fileController.writeLog(req, res, next, 500, err);
			return res.status(500).send(constants.ERR_SERVER);
		} else {
			if (!vatCondition || vatCondition.operationType == 'D') {
				fileController.writeLog(req, res, next, 404, constants.NO_DATA_FOUND);
				return res.status(404).send(constants.NO_DATA_FOUND);
			} else {
				fileController.writeLog(req, res, next, 200, vatCondition);
				return res.status(200).send({ vatCondition: vatCondition });
			}
		}
	});
}

function getVATConditions(req, res, next) {

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

	VATCondition.find(where).
		limit(limit).
		select(select).
		sort(sort).
		skip(skip).
		exec((err, vatConditions) => {
			if (err) {
				fileController.writeLog(req, res, next, 500, err);
				return res.status(500).send(constants.ERR_SERVER);
			} else {
				if (!vatConditions) {
					fileController.writeLog(req, res, next, 404, constants.NO_DATA_FOUND);
					return res.status(404).send(constants.NO_DATA_FOUND);
				} else if (vatConditions.length === 0) {
					fileController.writeLog(req, res, next, 200, constants.NO_DATA_FOUND);
					return res.status(200).send({ message: constants.NO_DATA_FOUND });
				} else {
					fileController.writeLog(req, res, next, 200, vatConditions.length);
					return res.status(200).send({ vatConditions: vatConditions });
				}
			}
		});
}

function getVATConditionsV2(req, res, next) {

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
						if (searchPropertyOfArray(JSON.parse(group), 'vatConditions')) {
							projectGroup = `{ "vatConditions": { "$slice": ["$vatConditions", ${skip}, ${limit}] }`;
						} else {
							projectGroup = `{ "items": { "$slice": ["$items", ${skip}, ${limit}] }`;
						}
						for (let prop of Object.keys(JSON.parse(group))) {
							if (prop !== 'vatConditions' && prop !== 'items') {
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

	VATCondition.aggregate(queryAggregate)
		.then(function (result) {
			fileController.writeLog(req, res, next, 200, result.length);
			if (result.length > 0) {
				if (group && group !== "{}" && group !== {}) {
					return res.status(200).send(result);
				} else {
					return res.status(200).send({ vatConditions: result });
				}
			} else {
				if (group && group !== "{}" && group !== {}) {
					return res.status(200).send({ count: 0, vatConditions: [] });
				} else {
					return res.status(200).send({ vatConditions: [] });
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

function saveVATCondition(req, res, next) {

	initConnectionDB(req.session.database);

	let vatCondition = new VATCondition();
	let params = req.body;

	vatCondition.code = params.code;
	vatCondition.description = params.description;
	vatCondition.discriminate = params.discriminate;
	vatCondition.observation = params.observation;
	vatCondition.transactionLetter = params.transactionLetter;

	let user = new User();
	user._id = req.session.user;
	vatCondition.creationUser = user;
	vatCondition.creationDate = moment().format('YYYY-MM-DDTHH:mm:ssZ');
	vatCondition.operationType = 'C';

	if (vatCondition.description &&
		vatCondition.code) {

		let json = '{"$and":[{"operationType": {"$ne": "D"}},';
		json = json + '{"description": "' + vatCondition.description + '"}]}';
		let where;
		try {
			where = JSON.parse(json);
		} catch (err) {
			fileController.writeLog(req, res, next, 500, json);
			fileController.writeLog(req, res, next, 500, err);
			return res.status(500).send(constants.ERR_SERVER);
		}

		VATCondition.find(where).exec((err, vatConditions) => {
			if (err) {
				fileController.writeLog(req, res, next, 500, err);
				return res.status(500).send(constants.ERR_SERVER);
			} else {
				if (!vatConditions || vatConditions.length === 0) {
					vatCondition.save((err, vatConditionSaved) => {
						if (err) {
							fileController.writeLog(req, res, next, 500, err);
							return res.status(500).send(constants.ERR_SERVER);
						} else {
							getVATCondition(req, res, next, vatConditionSaved._id);
						}
					});
				} else {
					let message = 'La condición de IVA \"' + vatCondition.description + '\" ya existe';
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

function updateVATCondition(req, res, next) {

	initConnectionDB(req.session.database);

	let vatConditionId = req.query.id;
	let vatCondition = req.body;

	let user = new User();
	user._id = req.session.user;
	vatCondition.updateUser = user;
	vatCondition.updateDate = moment().format('YYYY-MM-DDTHH:mm:ssZ');
	vatCondition.operationType = 'U';

	if (vatCondition.description &&
		vatCondition.code) {

		let json = '{"$and":[{"operationType": {"$ne": "D"}},';
		json = json + '{"description": "' + vatCondition.description + '"},';
		json = json + '{"_id": {"$ne": "' + vatConditionId + '"}}]}';
		let where;
		try {
			where = JSON.parse(json);
		} catch (err) {
			fileController.writeLog(req, res, next, 500, json);
			fileController.writeLog(req, res, next, 500, err);
			return res.status(500).send(constants.ERR_SERVER);
		}

		VATCondition.find(where).exec((err, vatConditions) => {
			if (err) {
				fileController.writeLog(req, res, next, 500, err);
				return res.status(500).send(constants.ERR_SERVER);
			} else {
				if (!vatConditions || vatConditions.length === 0) {
					VATCondition.findByIdAndUpdate(vatConditionId, vatCondition, (err, vatConditionUpdated) => {
						if (err) {
							fileController.writeLog(req, res, next, 500, err);
							return res.status(500).send(constants.ERR_SERVER);
						} else {
							getVATCondition(req, res, next, vatConditionUpdated._id);
						}
					});
				} else {
					let message = 'La condición de IVA \"' + vatCondition.description + '\" ya existe';
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

function deleteVATCondition(req, res, next) {

	initConnectionDB(req.session.database);

	let vatConditionId = req.query.id;

	let user = new User();
	user._id = req.session.user;

	VATCondition.findByIdAndUpdate(vatConditionId,
		{
			$set: {
				updateUser: user,
				updateDate: moment().format('YYYY-MM-DDTHH:mm:ssZ'),
				operationType: 'D'
			}
		}, (err, vatConditionUpdated) => {
			if (err) {
				fileController.writeLog(req, res, next, 500, err);
				return res.status(500).send(constants.ERR_SERVER);
			} else {
				fileController.writeLog(req, res, next, 200, vatConditionUpdated._id);
				return res.status(200).send({ vatCondition: vatConditionUpdated });
			}
		});
}

function initConnectionDB(database) {

	const Model = require('./../models/model');

	let VATConditionSchema = require('./../models/vat-condition');
	VATCondition = new Model('vat-condition', {
		schema: VATConditionSchema,
		connection: database
	});

	let UserSchema = require('./../models/user');
	User = new Model('user', {
		schema: UserSchema,
		connection: database
	});
}

module.exports = {
	getVATCondition,
	getVATConditions,
	getVATConditionsV2,
	saveVATCondition,
	updateVATCondition,
	deleteVATCondition
}