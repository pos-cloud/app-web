'use strict'

let fileController = require('./file.controller');
let constants = require('./../utilities/constants');
const { EJSON } = require('bson');
let moment = require('moment');
moment.locale('es');

let User;
let VariantValue;
let VariantType;

function getVariantValue(req, res, next, id = undefined) {

	initConnectionDB(req.session.database);

	let variantValueId;
	if (id) {
		variantValueId = id;
	} else {
		variantValueId = req.query.id;
	}

	VariantValue.findById(variantValueId, (err, variantValue) => {
		if (err) {
			fileController.writeLog(req, res, next, 500, err);
			return res.status(500).send(constants.ERR_SERVER);
		} else {
			if (!variantValue || variantValue.operationType == 'D') {
				fileController.writeLog(req, res, next, 404, constants.NO_DATA_FOUND);
				return res.status(404).send(constants.NO_DATA_FOUND);
			} else {
				VariantType.populate(variantValue, { path: 'type' }, (err, variantValue) => {
					if (err) {
						fileController.writeLog(req, res, next, 500, err);
						return res.status(500).send(constants.ERR_SERVER);
					} else if (!variantValue) {
						fileController.writeLog(req, res, next, 404, constants.NO_DATA_FOUND);
						return res.status(404).send(constants.NO_DATA_FOUND);
					} else {
						fileController.writeLog(req, res, next, 200, variantValue);
						return res.status(200).send({ variantValue: variantValue });
					}
				});
			}
		}
	});
}

function getVariantValues(req, res, next) {

	//http://localhost:3000/api/variantValues/limit=6&skip=0&select=description,code&sort="code":1&where="description":"s"

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

	VariantValue.find(where).
		limit(limit).
		select(select).
		sort(sort).
		skip(skip).
		exec((err, variantValues) => {
			if (err) {
				fileController.writeLog(req, res, next, 500, err);
				return res.status(500).send(constants.ERR_SERVER);
			} else {
				if (!variantValues) {
					fileController.writeLog(req, res, next, 404, constants.NO_DATA_FOUND);
					return res.status(404).send(constants.NO_DATA_FOUND);
				} else if (variantValues.length === 0) {
					fileController.writeLog(req, res, next, 200, constants.NO_DATA_FOUND);
					return res.status(200).send({ message: constants.NO_DATA_FOUND });
				} else {
					VariantType.populate(variantValues, { path: 'type' }, (err, variantValues) => {
						if (err) {
							fileController.writeLog(req, res, next, 500, err);
							return res.status(500).send(constants.ERR_SERVER);
						} else if (!variantValues) {
							fileController.writeLog(req, res, next, 404, constants.NO_DATA_FOUND);
							return res.status(404).send(constants.NO_DATA_FOUND);
						} else {
							fileController.writeLog(req, res, next, 200, 'VariantValue ' + variantValues.length);
							return res.status(200).send({ variantValues: variantValues });
						}
					});
				}
			}
		});
}

function getVariantValuesV2(req, res, next) {

	initConnectionDB(req.session.database);

	let queryAggregate = [];
	let group;

	if (req.query && req.query !== {}) {

		let error;

		let project = req.query.project;
		if (project && project !== {} && project !== "{}") {
			try {
				project = JSON.parse(project);

				if (searchPropertyOfArray(project, 'type.')) {
					queryAggregate.push({ $lookup: { from: "variant-types", foreignField: "_id", localField: "type", as: "type" } });
					queryAggregate.push({ $unwind: { path: "$type", preserveNullAndEmptyArrays: true } });
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
						if (searchPropertyOfArray(JSON.parse(group), 'variantValues')) {
							projectGroup = `{ "variantValues": { "$slice": ["$variantValues", ${skip}, ${limit}] }`;
						} else {
							projectGroup = `{ "items": { "$slice": ["$items", ${skip}, ${limit}] }`;
						}
						for (let prop of Object.keys(JSON.parse(group))) {
							if (prop !== 'variantValues' && prop !== 'items') {
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

	VariantValue.aggregate(queryAggregate)
		.then(function (result) {
			fileController.writeLog(req, res, next, 200, result.length);
			if (result.length > 0) {
				if (group && group !== "{}" && group !== {}) {
					return res.status(200).send(result);
				} else {
					return res.status(200).send({ variantValues: result });
				}
			} else {
				if (group && group !== "{}" && group !== {}) {
					return res.status(200).send({ count: 0, variantValues: [] });
				} else {
					return res.status(200).send({ variantValues: [] });
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

function saveVariantValue(req, res, next) {

	initConnectionDB(req.session.database);

	let variantValue = new VariantValue();
	let params = req.body;

	variantValue.type = params.type;
	variantValue.order = params.order;
	variantValue.description = params.description;

	let user = new User();
	user._id = req.session.user;
	variantValue.creationUser = user;
	variantValue.creationDate = moment().format('YYYY-MM-DDTHH:mm:ssZ');
	variantValue.operationType = 'C';

	if (variantValue.description) {

		let json = '{"$and":[{"operationType": {"$ne": "D"}},';
		if (variantValue.type._id) {
			json = json + '{"type": "' + variantValue.type._id + '"},';
		} else {
			json = json + '{"type": "' + variantValue.type + '"},';
		}
		json = json + '{"description": "' + variantValue.description + '"}]}';
		let where;
		try {
			where = JSON.parse(json);
		} catch (err) {
			fileController.writeLog(req, res, next, 500, json);
			fileController.writeLog(req, res, next, 500, err);
			return res.status(500).send(constants.ERR_SERVER);
		}

		VariantValue.find(where).exec((err, variantValues) => {
			if (err) {
				fileController.writeLog(req, res, next, 500, err);
				return res.status(500).send(constants.ERR_SERVER);
			} else {
				if (!variantValues || variantValues.length === 0) {
					variantValue.save((err, variantValueSaved) => {
						if (err) {
							fileController.writeLog(req, res, next, 500, err);
							return res.status(500).send(constants.ERR_SERVER);
						} else {
							getVariantValue(req, res, next, variantValueSaved._id);
						}
					});
				} else {
					let message = 'El valor de variante \"' + variantValue.description + '\" ya existe';
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

function updateVariantValue(req, res, next) {

	initConnectionDB(req.session.database);

	let variantValueId = req.query.id;
	let variantValue = req.body;

	let user = new User();
	user._id = req.session.user;
	variantValue.updateUser = user;
	variantValue.updateDate = moment().format('YYYY-MM-DDTHH:mm:ssZ');
	variantValue.operationType = 'U';

	if (variantValue.description) {

		let json = '{"$and":[{"operationType": {"$ne": "D"}},';
		if (variantValue.type._id) {
			json = json + '{"type": "' + variantValue.type._id + '"},';
		} else {
			json = json + '{"type": "' + variantValue.type + '"},';
		}
		json = json + '{"description": "' + variantValue.description + '"},';
		json = json + '{"_id": {"$ne": "' + variantValueId + '"}}]}';
		let where;
		try {
			where = JSON.parse(json);
		} catch (err) {
			fileController.writeLog(req, res, next, 500, json);
			fileController.writeLog(req, res, next, 500, err);
			return res.status(500).send(constants.ERR_SERVER);
		}

		VariantValue.find(where).exec((err, variantValues) => {
			if (err) {
				fileController.writeLog(req, res, next, 500, err);
				return res.status(500).send(constants.ERR_SERVER);
			} else {
				if (!variantValues || variantValues.length === 0) {
					VariantValue.findByIdAndUpdate(variantValueId, variantValue, (err, variantValueUpdated) => {
						if (err) {
							fileController.writeLog(req, res, next, 500, err);
							return res.status(500).send(constants.ERR_SERVER);
						} else {
							getVariantValue(req, res, next, variantValueUpdated._id);
						}
					});
				} else {
					let message = 'El valor de variante \"' + variantValue.description + '\" ya existe';
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

function deleteVariantValue(req, res, next) {

	initConnectionDB(req.session.database);

	let variantValueId = req.query.id;

	let user = new User();
	user._id = req.session.user;

	VariantValue.findByIdAndUpdate(variantValueId,
		{
			$set: {
				updateUser: user,
				updateDate: moment().format('YYYY-MM-DDTHH:mm:ssZ'),
				operationType: 'D'
			}
		}, (err, variantValueUpdated) => {
			if (err) {
				fileController.writeLog(req, res, next, 500, err);
				return res.status(500).send(constants.ERR_SERVER);
			} else {
				fileController.writeLog(req, res, next, 200, "VariantValue " + variantValueUpdated);
				return res.status(200).send({ variantValue: variantValueUpdated });
			}
		});
}

function initConnectionDB(database) {

	const Model = require('./../models/model');

	let VariantValueSchema = require('./../models/variant-value');
	VariantValue = new Model('variant-value', {
		schema: VariantValueSchema,
		connection: database
	});

	let VariantTypeSchema = require('./../models/variant-type');
	VariantType = new Model('variant-type', {
		schema: VariantTypeSchema,
		connection: database
	});

	let UserSchema = require('./../models/user');
	User = new Model('user', {
		schema: UserSchema,
		connection: database
	});
}

module.exports = {
	getVariantValue,
	getVariantValues,
	getVariantValuesV2,
	saveVariantValue,
	updateVariantValue,
	deleteVariantValue
}