'use strict'

let fileController = require('./file.controller');
let constants = require('./../utilities/constants');
const { EJSON } = require('bson');
let moment = require('moment');
moment.locale('es');

let User;
let UnitOfMeasurement;

function getUnitOfMeasurement(req, res, next, id = undefined) {

	initConnectionDB(req.session.database);

	let unitOfMeasurementId;
	if (id) {
		unitOfMeasurementId = id;
	} else {
		unitOfMeasurementId = req.query.id;
	}

	UnitOfMeasurement.findById(unitOfMeasurementId, (err, unitOfMeasurement) => {
		if (err) {
			fileController.writeLog(req, res, next, 500, err);
			return res.status(500).send(constants.ERR_SERVER);
		} else {
			User.populate(unitOfMeasurement, { path: 'creationUser' }, (err, unitOfMeasurement) => {
				if (err) {
					fileController.writeLog(req, res, next, 500, err);
					return res.status(500).send(constants.ERR_SERVER);
				} else {
					User.populate(unitOfMeasurement, { path: 'updateUser' }, (err, unitOfMeasurement) => {
						if (err) {
							fileController.writeLog(req, res, next, 500, err);
							return res.status(500).send(constants.ERR_SERVER);
						} else {
							if (!unitOfMeasurement || unitOfMeasurement.operationType == 'D') {
								fileController.writeLog(req, res, next, 404, constants.NO_DATA_FOUND);
								return res.status(404).send(constants.NO_DATA_FOUND);
							} else {
								fileController.writeLog(req, res, next, 200, unitOfMeasurement);
								return res.status(200).send({ unitOfMeasurement: unitOfMeasurement });
							}
						}
					});
				}
			});
		}
	});
}

function getUnitsOfMeasurement(req, res, next) {

	//http://localhost:3000/api/unitsOfMeasurement/limit=6&skip=0&select=name,code&sort="code":1&where="name":"s"

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

	UnitOfMeasurement.find(where).
		limit(limit).
		select(select).
		sort(sort).
		skip(skip).
		exec((err, unitsOfMeasurement) => {
			if (err) {
				fileController.writeLog(req, res, next, 500, err);
				return res.status(500).send(constants.ERR_SERVER);
			} else {
				User.populate(unitsOfMeasurement, { path: 'creationUser' }, (err, unitsOfMeasurement) => {
					if (err) {
						fileController.writeLog(req, res, next, 500, err);
						return res.status(500).send(constants.ERR_SERVER);
					} else {
						User.populate(unitsOfMeasurement, { path: 'updateUser' }, (err, unitsOfMeasurement) => {
							if (err) {
								fileController.writeLog(req, res, next, 500, err);
								return res.status(500).send(constants.ERR_SERVER);
							} else {
								if (!unitsOfMeasurement) {
									fileController.writeLog(req, res, next, 404, constants.NO_DATA_FOUND);
									return res.status(404).send(constants.NO_DATA_FOUND);
								} else if (unitsOfMeasurement.length === 0) {
									fileController.writeLog(req, res, next, 200, constants.NO_DATA_FOUND);
									return res.status(200).send({ message: constants.NO_DATA_FOUND });
								} else {
									fileController.writeLog(req, res, next, 200, 'unitsOfMeasurement ' + unitsOfMeasurement.length);
									return res.status(200).send({ unitsOfMeasurement: unitsOfMeasurement });
								}
							}
						});
					}
				});
			}
		});
}

function getUnitsOfMeasurementV2(req, res, next) {

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
						if (searchPropertyOfArray(JSON.parse(group), 'unitsOfMeasurement')) {
							projectGroup = `{ "unitsOfMeasurement": { "$slice": ["$unitsOfMeasurement", ${skip}, ${limit}] }`;
						} else {
							projectGroup = `{ "items": { "$slice": ["$items", ${skip}, ${limit}] }`;
						}
						for (let prop of Object.keys(JSON.parse(group))) {
							if (prop !== 'unitsOfMeasurement' && prop !== 'items') {
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

	UnitOfMeasurement.aggregate(queryAggregate)
		.then(function (result) {
			fileController.writeLog(req, res, next, 200, result.length);
			if (result.length > 0) {
				if (group && group !== "{}" && group !== {}) {
					return res.status(200).send(result);
				} else {
					return res.status(200).send({ unitsOfMeasurement: result });
				}
			} else {
				if (group && group !== "{}" && group !== {}) {
					return res.status(200).send({ count: 0, unitsOfMeasurement: [] });
				} else {
					return res.status(200).send({ unitsOfMeasurement: [] });
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

function saveUnitOfMeasurement(req, res, next) {

	initConnectionDB(req.session.database);

	let unitOfMeasurement = new UnitOfMeasurement();
	let params = req.body;

	unitOfMeasurement.code = params.code;
	unitOfMeasurement.abbreviation = params.abbreviation;
	unitOfMeasurement.name = params.name;

	let user = new User();
	user._id = req.session.user;
	unitOfMeasurement.creationUser = user;
	unitOfMeasurement.creationDate = moment().format('YYYY-MM-DDTHH:mm:ssZ');
	unitOfMeasurement.operationType = 'C';

	if (unitOfMeasurement.code) {

		let json = '{"$and":[{"operationType": {"$ne": "D"}},';
		json = json + '{"code": "' + unitOfMeasurement.code + '"}]}';
		let where;
		try {
			where = JSON.parse(json);
		} catch (err) {
			fileController.writeLog(req, res, next, 500, json);
			fileController.writeLog(req, res, next, 500, err);
			return res.status(500).send(constants.ERR_SERVER);
		}

		UnitOfMeasurement.find(where).exec((err, unitsOfMeasurement) => {
			if (err) {
				fileController.writeLog(req, res, next, 500, err);
				return res.status(500).send(constants.ERR_SERVER);
			} else {
				if (!unitsOfMeasurement || unitsOfMeasurement.length === 0) {
					unitOfMeasurement.save((err, unitOfMeasurementSaved) => {
						if (err) {
							fileController.writeLog(req, res, next, 500, err);
							return res.status(500).send(constants.ERR_SERVER);
						} else {
							getUnitOfMeasurement(req, res, next, unitOfMeasurementSaved._id);
						}
					});
				} else {
					let message = 'La unidad de medida \"' + unitOfMeasurement.code + '\" ya existe';
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

function updateUnitOfMeasurement(req, res, next) {

	initConnectionDB(req.session.database);

	let unitOfMeasurementId = req.query.id;
	let unitOfMeasurement = req.body;

	let user = new User();
	user._id = req.session.user;
	unitOfMeasurement.updateUser = user;
	unitOfMeasurement.operationType = 'U';

	if (unitOfMeasurement.code) {

		let json = '{"$and":[{"operationType": {"$ne": "D"}},';
		json = json + '{"code": "' + unitOfMeasurement.code + '"},';
		json = json + '{"_id": {"$ne": "' + unitOfMeasurementId + '"}}]}';
		let where;
		try {
			where = JSON.parse(json);
		} catch (err) {
			fileController.writeLog(req, res, next, 500, json);
			fileController.writeLog(req, res, next, 500, err);
			return res.status(500).send(constants.ERR_SERVER);
		}

		UnitOfMeasurement.find(where).exec((err, unitsOfMeasurement) => {
			if (err) {
				fileController.writeLog(req, res, next, 500, err);
				return res.status(500).send(constants.ERR_SERVER);
			} else {
				if (!unitsOfMeasurement || unitsOfMeasurement.length === 0) {
					UnitOfMeasurement.findByIdAndUpdate(unitOfMeasurementId, unitOfMeasurement, (err, unitOfMeasurementUpdated) => {
						if (err) {
							fileController.writeLog(req, res, next, 500, err);
							return res.status(500).send(constants.ERR_SERVER);
						} else {
							getUnitOfMeasurement(req, res, next, unitOfMeasurementUpdated._id);
						}
					});
				} else {
					let message = 'La unidad de medida \"' + unitOfMeasurement.code + '\" ya existe';
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

function deleteUnitOfMeasurement(req, res, next) {

	initConnectionDB(req.session.database);

	let unitOfMeasurementId = req.query.id;

	let user = new User();
	user._id = req.session.user;

	UnitOfMeasurement.findByIdAndUpdate(unitOfMeasurementId,
		{
			$set: {
				updateUser: user,
				updateDate: moment().format('YYYY-MM-DDTHH:mm:ssZ'),
				operationType: 'D'
			}
		}, (err, unitOfMeasurementUpdated) => {
			if (err) {
				fileController.writeLog(req, res, next, 500, err);
				return res.status(500).send(constants.ERR_SERVER);
			} else {
				fileController.writeLog(req, res, next, 200, "UnitOfMeasurement " + unitOfMeasurementUpdated);
				return res.status(200).send({ unitOfMeasurement: unitOfMeasurementUpdated });
			}
		});
}

function initConnectionDB(database) {

	const Model = require('./../models/model');

	let UnitOfMeasurementSchema = require('./../models/unit-of-measurement');
	UnitOfMeasurement = new Model('unit-of-measurement', {
		schema: UnitOfMeasurementSchema,
		connection: database
	});

	let UserSchema = require('./../models/user');
	User = new Model('user', {
		schema: UserSchema,
		connection: database
	});
}

module.exports = {
	getUnitOfMeasurement,
	getUnitsOfMeasurement,
	getUnitsOfMeasurementV2,
	saveUnitOfMeasurement,
	updateUnitOfMeasurement,
	deleteUnitOfMeasurement
}