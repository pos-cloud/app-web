'use strict'

let fileController = require('./file.controller');
let constants = require('../utilities/constants');
const { EJSON } = require('bson');
let moment = require('moment');
moment.locale('es');

let Origin;
let User;
let Branch;

function getOrigin(req, res, next, id = undefined) {

	initConnectionDB(req.session.database);

	let originId;
	if (id) {
		originId = id;
	} else {
		originId = req.query.id;
	}

	Origin.findById(originId, (err, origin) => {
		if (err) {
			fileController.writeLog(req, res, next, 500, err);
			return res.status(500).send(err);
		} else {
			if (!origin || origin.operationType == 'D') {
				fileController.writeLog(req, res, next, 404, constants.NO_DATA_FOUND);
				return res.status(404).send(constants.NO_DATA_FOUND);
			} else {
				fileController.writeLog(req, res, next, 200, origin);
				return res.status(200).send({ origin: origin });
			}
		}
	})
		.populate({
			path: 'branch',
			model: Branch
		})
		.populate({
			path: 'creationUser',
			model: User
		})
		.populate({
			path: 'updateUser',
			model: User
		})
}

function getOrigins(req, res, next) {

	initConnectionDB(req.session.database);

	let queryAggregate = [];
	let group;

	if (req.query && req.query !== {}) {

		let error;

		let project = req.query.project;
		if (project && project !== {} && project !== "{}") {
			try {
				project = JSON.parse(project);

				if (searchPropertyOfArray(project, 'branch.')) {
					queryAggregate.push({ $lookup: { from: "branches", foreignField: "_id", localField: "branch", as: "branch" } });
					queryAggregate.push({ $unwind: { path: "$branch", preserveNullAndEmptyArrays: true } });
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
						if (searchPropertyOfArray(JSON.parse(group), 'origins')) {
							projectGroup = `{ "origins": { "$slice": ["$origins", ${skip}, ${limit}] }`;
						} else {
							projectGroup = `{ "items": { "$slice": ["$items", ${skip}, ${limit}] }`;
						}
						for (let prop of Object.keys(JSON.parse(group))) {
							if (prop !== 'origins' && prop !== 'items') {
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

	Origin.aggregate(queryAggregate)
		.then(function (result) {
			fileController.writeLog(req, res, next, 200, result.length);
			if (result.length > 0) {
				if (group && group !== "{}" && group !== {}) {
					return res.status(200).send(result);
				} else {
					return res.status(200).send({ origins: result });
				}
			} else {
				if (group && group !== "{}" && group !== {}) {
					return res.status(200).send({ count: 0, origins: [] });
				} else {
					return res.status(200).send({ origins: [] });
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

function saveOrigin(req, res, next) {

	initConnectionDB(req.session.database);

	let params = req.body;

	let origin = new Origin();
	origin.number = params.number;
	origin.branch = params.branch;

	let user = new User();
	user._id = req.session.user;
	origin.creationUser = user;
	origin.creationDate = moment().format('YYYY-MM-DDTHH:mm:ssZ');
	origin.operationType = 'C';

	if (origin.branch) {

		let json = '{"$and":[{"operationType": {"$ne": "D"}},';
		json = json + '{"number": "' + origin.number + '"}]}';

		let where;
		try {
			where = JSON.parse(json);
		} catch (err) {
			fileController.writeLog(req, res, next, 500, json);
			fileController.writeLog(req, res, next, 500, err);
			return res.status(500).send(constants.ERR_SERVER);
		}

		Origin.find(where).exec((err, origins) => {
			if (err) {
				fileController.writeLog(req, res, next, 500, err);
				return res.status(500).send(constants.ERR_SERVER);
			} else {
				if (!origins || origins.length === 0) {
					origin.save((err, originSave) => {
						if (err) {
							fileController.writeLog(req, res, next, 500, err);
							return res.status(500).send(err);
						} else {
							fileController.writeLog(req, res, next, 200, originSave._id);
							getOrigin(req, res, next, originSave._id);
						}
					});
				} else {
					let message = 'El punto de venta ya existe';
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

function updateOrigin(req, res, next) {

	initConnectionDB(req.session.database);

	let originId = req.query.id;
	let origin = req.body;

	let user = new User();
	user._id = req.session.user;
	origin.updateUser = user;
	origin.updateDate = moment().format('YYYY-MM-DDTHH:mm:ssZ');
	origin.operationType = 'U';


	if (origin.branch) {

		let json = '{"$and":[{"operationType": {"$ne": "D"}},';
		json = json + '{"number": "' + origin.number + '"},';
		json = json + '{"_id": {"$ne": "' + originId + '"}}]}';

		let where;
		try {
			where = JSON.parse(json);
		} catch (err) {
			fileController.writeLog(req, res, next, 500, json);
			fileController.writeLog(req, res, next, 500, err);
			return res.status(500).send(constants.ERR_SERVER);
		}

		Origin.find(where).exec((err, origins) => {
			if (err) {
				fileController.writeLog(req, res, next, 500, err);
				return res.status(500).send(constants.ERR_SERVER);
			} else {
				if (!origins || origins.length === 0) {
					Origin.findByIdAndUpdate(originId, origin, (err, originUpdated) => {
						if (err) {
							fileController.writeLog(req, res, next, 500, err);
							return res.status(500).send(err);
						} else {
							fileController.writeLog(req, res, next, 200, originUpdated._id);
							getOrigin(req, res, next, originUpdated._id);
						}
					});
				} else {
					let message = 'El punto de venta ya existe';
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

function deleteOrigin(req, res, next) {

	initConnectionDB(req.session.database);

	let originId = req.query.id;

	let user = new User();
	user._id = req.session.user;

	Origin.findByIdAndUpdate(originId,
		{
			$set: {
				updateUser: user,
				updateDate: moment().format('YYYY-MM-DDTHH:mm:ssZ'),
				operationType: 'D'
			}
		}, (err, originDelete) => {
			if (err) {
				fileController.writeLog(req, res, next, 500, err);
				return res.status(500).send(constants.ERR_SERVER);
			} else {
				fileController.writeLog(req, res, next, 200, originDelete._id);
				return res.status(200).send({ origin: originDelete });
			}
		});
}

function initConnectionDB(database) {

	const Model = require('../models/model');

	let OriginSchema = require('./../models/origin');
	Origin = new Model('origin', {
		schema: OriginSchema,
		connection: database
	});

	let BranchSchema = require('./../models/branch');
	Branch = new Model('branch', {
		schema: BranchSchema,
		connection: database
	});

	let UserSchema = require('../models/user');
	User = new Model('user', {
		schema: UserSchema,
		connection: database
	});

}

module.exports = {
	getOrigin,
	getOrigins,
	saveOrigin,
	updateOrigin,
	deleteOrigin
}