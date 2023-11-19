'use strict'

let fileController = require('./file.controller');
let constants = require('./../utilities/constants');
const { EJSON } = require('bson');
let moment = require('moment');
moment.locale('es');

let User;
let UseOfCFDI;

function getUseOfCFDI(req, res, next, id = undefined) {

	initConnectionDB(req.session.database);

	let useOfCFDIId;
	if (id) {
		useOfCFDIId = id;
	} else {
		useOfCFDIId = req.query.id;
	}

	UseOfCFDI.findById(useOfCFDIId, (err, useOfCFDI) => {
		if (err) {
			fileController.writeLog(req, res, next, 500, err);
			return res.status(500).send(constants.ERR_SERVER);
		} else {
			User.populate(useOfCFDI, { path: 'creationUser' }, (err, useOfCFDI) => {
				if (err) {
					fileController.writeLog(req, res, next, 500, err);
					return res.status(500).send(constants.ERR_SERVER);
				} else {
					User.populate(useOfCFDI, { path: 'updateUser' }, (err, useOfCFDI) => {
						if (err) {
							fileController.writeLog(req, res, next, 500, err);
							return res.status(500).send(constants.ERR_SERVER);
						} else {
							if (!useOfCFDI || useOfCFDI.operationType == 'D') {
								fileController.writeLog(req, res, next, 404, constants.NO_DATA_FOUND);
								return res.status(404).send(constants.NO_DATA_FOUND);
							} else {
								fileController.writeLog(req, res, next, 200, useOfCFDI);
								return res.status(200).send({ useOfCFDI: useOfCFDI });
							}
						}
					});
				}
			});
		}
	});
}

function getUsesOfCFDI(req, res, next) {

	//http://localhost:3000/api/useOfCFDIs/limit=6&skip=0&select=description,code&sort="code":1&where="description":"s"

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

	UseOfCFDI.find(where).
		limit(limit).
		select(select).
		sort(sort).
		skip(skip).
		exec((err, usesOfCFDI) => {
			if (err) {
				fileController.writeLog(req, res, next, 500, err);
				return res.status(500).send(constants.ERR_SERVER);
			} else {
				User.populate(usesOfCFDI, { path: 'creationUser' }, (err, usesOfCFDI) => {
					if (err) {
						fileController.writeLog(req, res, next, 500, err);
						return res.status(500).send(constants.ERR_SERVER);
					} else {
						User.populate(usesOfCFDI, { path: 'updateUser' }, (err, usesOfCFDI) => {
							if (err) {
								fileController.writeLog(req, res, next, 500, err);
								return res.status(500).send(constants.ERR_SERVER);
							} else {
								if (!usesOfCFDI) {
									fileController.writeLog(req, res, next, 404, constants.NO_DATA_FOUND);
									return res.status(404).send(constants.NO_DATA_FOUND);
								} else if (usesOfCFDI.length === 0) {
									fileController.writeLog(req, res, next, 200, constants.NO_DATA_FOUND);
									return res.status(200).send({ message: constants.NO_DATA_FOUND });
								} else {
									fileController.writeLog(req, res, next, 200, 'UsesOfCFDI ' + usesOfCFDI.length);
									return res.status(200).send({ usesOfCFDI: usesOfCFDI });
								}
							}
						});
					}
				});
			}
		});
}

function getUsesOfCFDIV2(req, res, next) {

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
						if (searchPropertyOfArray(JSON.parse(group), 'usesOfCFDI')) {
							projectGroup = `{ "usesOfCFDI": { "$slice": ["$usesOfCFDI", ${skip}, ${limit}] }`;
						} else {
							projectGroup = `{ "items": { "$slice": ["$items", ${skip}, ${limit}] }`;
						}
						for (let prop of Object.keys(JSON.parse(group))) {
							if (prop !== 'usesOfCFDI' && prop !== 'items') {
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

	UseOfCFDI.aggregate(queryAggregate)
		.then(function (result) {
			fileController.writeLog(req, res, next, 200, result.length);
			if (result.length > 0) {
				if (group && group !== "{}" && group !== {}) {
					return res.status(200).send(result);
				} else {
					return res.status(200).send({ usesOfCFDI: result });
				}
			} else {
				if (group && group !== "{}" && group !== {}) {
					return res.status(200).send({ count: 0, usesOfCFDI: [] });
				} else {
					return res.status(200).send({ usesOfCFDI: [] });
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

function saveUseOfCFDI(req, res, next) {

	initConnectionDB(req.session.database);

	let useOfCFDI = new UseOfCFDI();
	let params = req.body;

	useOfCFDI.code = params.code;
	useOfCFDI.description = params.description;

	let user = new User();
	user._id = req.session.user;
	useOfCFDI.creationUser = user;
	useOfCFDI.creationDate = moment().format('YYYY-MM-DDTHH:mm:ssZ');
	useOfCFDI.operationType = 'C';

	if (useOfCFDI.code && useOfCFDI.description) {

		let json = '{"$and":[{"operationType": {"$ne": "D"}},';
		json = json + '{"code": "' + useOfCFDI.code + '"}]}';
		let where;
		try {
			where = JSON.parse(json);
		} catch (err) {
			fileController.writeLog(req, res, next, 500, json);
			fileController.writeLog(req, res, next, 500, err);
			return res.status(500).send(constants.ERR_SERVER);
		}

		UseOfCFDI.find(where).exec((err, useOfCFDIs) => {
			if (err) {
				fileController.writeLog(req, res, next, 500, err);
				return res.status(500).send(constants.ERR_SERVER);
			} else {
				if (!useOfCFDIs || useOfCFDIs.length === 0) {
					useOfCFDI.save((err, useOfCFDISaved) => {
						if (err) {
							fileController.writeLog(req, res, next, 500, err);
							return res.status(500).send(constants.ERR_SERVER);
						} else {
							getUseOfCFDI(req, res, next, useOfCFDISaved._id);
						}
					});
				} else {
					let message = 'El Uso de CFDI \"' + useOfCFDI.code + '\" ya existe';
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

function updateUseOfCFDI(req, res, next) {

	initConnectionDB(req.session.database);

	let useOfCFDIId = req.query.id;
	let useOfCFDI = req.body;

	let user = new User();
	user._id = req.session.user;
	useOfCFDI.updateUser = user;
	useOfCFDI.operationType = 'U';

	if (useOfCFDI.code && useOfCFDI.description) {

		let json = '{"$and":[{"operationType": {"$ne": "D"}},';
		json = json + '{"code": "' + useOfCFDI.code + '"},';
		json = json + '{"_id": {"$ne": "' + useOfCFDIId + '"}}]}';
		let where;
		try {
			where = JSON.parse(json);
		} catch (err) {
			fileController.writeLog(req, res, next, 500, json);
			fileController.writeLog(req, res, next, 500, err);
			return res.status(500).send(constants.ERR_SERVER);
		}

		UseOfCFDI.find(where).exec((err, useOfCFDIs) => {
			if (err) {
				fileController.writeLog(req, res, next, 500, err);
				return res.status(500).send(constants.ERR_SERVER);
			} else {
				if (!useOfCFDIs || useOfCFDIs.length === 0) {
					UseOfCFDI.findByIdAndUpdate(useOfCFDIId, useOfCFDI, (err, useOfCFDIUpdated) => {
						if (err) {
							fileController.writeLog(req, res, next, 500, err);
							return res.status(500).send(constants.ERR_SERVER);
						} else {
							getUseOfCFDI(req, res, next, useOfCFDIUpdated._id);
						}
					});
				} else {
					let message = 'El Uso de CFDI \"' + useOfCFDI.code + '\" ya existe';
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

function deleteUseOfCFDI(req, res, next) {

	initConnectionDB(req.session.database);

	let useOfCFDIId = req.query.id;

	let user = new User();
	user._id = req.session.user;

	UseOfCFDI.findByIdAndUpdate(useOfCFDIId,
		{
			$set: {
				updateUser: user,
				updateDate: moment().format('YYYY-MM-DDTHH:mm:ssZ'),
				operationType: 'D'
			}
		}, (err, useOfCFDIUpdated) => {
			if (err) {
				fileController.writeLog(req, res, next, 500, err);
				return res.status(500).send(constants.ERR_SERVER);
			} else {
				fileController.writeLog(req, res, next, 200, "UseOfCFDI " + useOfCFDIUpdated);
				return res.status(200).send({ useOfCFDI: useOfCFDIUpdated });
			}
		});
}

function initConnectionDB(database) {

	const Model = require('./../models/model');

	let UseOfCFDISchema = require('./../models/use-of-CFDI');
	UseOfCFDI = new Model('uses-of-cfdi', {
		schema: UseOfCFDISchema,
		connection: database
	});

	let UserSchema = require('./../models/user');
	User = new Model('user', {
		schema: UserSchema,
		connection: database
	});
}

module.exports = {
	getUseOfCFDI,
	getUsesOfCFDI,
	getUsesOfCFDIV2,
	saveUseOfCFDI,
	updateUseOfCFDI,
	deleteUseOfCFDI
}