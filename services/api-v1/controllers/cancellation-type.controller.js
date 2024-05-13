'use strict'

let fileController = require('./file.controller');
let constants = require('../utilities/constants');
const { EJSON } = require('bson');
let moment = require('moment');
moment.locale('es');

let CancellationType;
let User;
let TransactionType;

function getCancellationType(req, res, next, id = undefined) {

	initConnectionDB(req.session.database);

	let cancellationTypeId;
	if (id) {
		cancellationTypeId = id;
	} else {
		cancellationTypeId = req.query.id;
	}

	CancellationType.findById(cancellationTypeId, (err, cancellationType) => {
		if (err) {
			fileController.writeLog(req, res, next, 500, err);
			return res.status(500).send(err);
		} else {
			if (!cancellationType || cancellationType.operationType == 'D') {
				fileController.writeLog(req, res, next, 404, constants.NO_DATA_FOUND);
				return res.status(404).send(constants.NO_DATA_FOUND);
			} else {
				TransactionType.populate(cancellationType, { path: 'origin' }, (err, cancellationType) => {
					if (err) {
						fileController.writeLog(req, res, next, 500, err);
						return res.status(500).send(constants.ERR_SERVER);
					} else if (!cancellationType) {
						fileController.writeLog(req, res, next, 404, constants.NO_DATA_FOUND);
						return res.status(404).send(constants.NO_DATA_FOUND);
					} else {
						TransactionType.populate(cancellationType, { path: 'destination' }, (err, cancellationType) => {
							if (err) {
								fileController.writeLog(req, res, next, 500, err);
								return res.status(500).send(constants.ERR_SERVER);
							} else if (!cancellationType) {
								fileController.writeLog(req, res, next, 404, constants.NO_DATA_FOUND);
								return res.status(404).send(constants.NO_DATA_FOUND);
							} else {
								fileController.writeLog(req, res, next, 200, cancellationType);
								return res.status(200).send({ cancellationType: cancellationType });
							}
						});
					}
				});
			}
		}
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

function getCancellationTypes(req, res, next) {

	initConnectionDB(req.session.database);

	let queryAggregate = [];
	let group;

	if (req.query && req.query !== {}) {

		let error;

		let project = req.query.project;
		if (project && project !== {} && project !== "{}") {
			try {
				project = JSON.parse(project);

				if (searchPropertyOfArray(project, 'origin.')) {
					queryAggregate.push({ $lookup: { from: "transaction-types", foreignField: "_id", localField: "origin", as: "origin" } });
					queryAggregate.push({ $unwind: { path: "$origin", preserveNullAndEmptyArrays: true } });
				}

				if (searchPropertyOfArray(project, 'destination.')) {
					queryAggregate.push({ $lookup: { from: "transaction-types", foreignField: "_id", localField: "destination", as: "destination" } });
					queryAggregate.push({ $unwind: { path: "$destination", preserveNullAndEmptyArrays: true } });
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
						if (searchPropertyOfArray(JSON.parse(group), 'cancellationTypes')) {
							projectGroup = `{ "cancellationTypes": { "$slice": ["$cancellationTypes", ${skip}, ${limit}] }`;
						} else {
							projectGroup = `{ "items": { "$slice": ["$items", ${skip}, ${limit}] }`;
						}
						for (let prop of Object.keys(JSON.parse(group))) {
							if (prop !== 'cancellationTypes' && prop !== 'items') {
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

	CancellationType.aggregate(queryAggregate)
		.then(function (result) {
			fileController.writeLog(req, res, next, 200, result.length);
			if (result.length > 0) {
				if (group && group !== "{}" && group !== {}) {
					return res.status(200).send(result);
				} else {
					return res.status(200).send({ cancellationTypes: result });
				}
			} else {
				if (group && group !== "{}" && group !== {}) {
					return res.status(200).send({ count: 0, cancellationTypes: [] });
				} else {
					return res.status(200).send({ cancellationTypes: [] });
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

function saveCancellationType(req, res, next) {

	initConnectionDB(req.session.database);

	let cancellationType = new CancellationType();
	let params = req.body;

	cancellationType.origin = params.origin;
	cancellationType.destination = params.destination;
	cancellationType.automaticSelection = params.automaticSelection;
	cancellationType.modifyBalance = params.modifyBalance;
    cancellationType.requestAutomatic = params.requestAutomatic;
    cancellationType.requestCompany = params.requestCompany;
	cancellationType.stateOrigin = params.stateOrigin;
	cancellationType.requestStatusOrigin = params.requestStatusOrigin;
    cancellationType.updatePrices = params.updatePrices;
	cancellationType.cancelByArticle = params.cancelByArticle 

	let user = new User();
	user._id = req.session.user;
	cancellationType.creationUser = user;
	cancellationType.creationDate = moment().format('YYYY-MM-DDTHH:mm:ssZ');
	cancellationType.operationType = 'C';

	if (cancellationType.origin && cancellationType.destination) {

		let json = '{"$and":[{"operationType": {"$ne": "D"}},';
		if (cancellationType.origin._id) {
			json = json + '{"origin": "' + cancellationType.origin._id + '"},';
		} else {
			json = json + '{"origin": "' + cancellationType.origin + '"},';
		}
		if (cancellationType.destination._id) {
			json = json + '{"destination": "' + cancellationType.destination._id + '"}]}';
		} else {
			json = json + '{"destination": "' + cancellationType.destination + '"}]}';
		}
		let where;
		try {
			where = JSON.parse(json);
		} catch (err) {
			fileController.writeLog(req, res, next, 500, json);
			fileController.writeLog(req, res, next, 500, err);
			return res.status(500).send(constants.ERR_SERVER);
		}

		CancellationType.find(where).exec((err, cancellationTypes) => {
			if (err) {
				fileController.writeLog(req, res, next, 500, err);
				return res.status(500).send(constants.ERR_SERVER);
			} else {
				if (!cancellationTypes || cancellationTypes.length === 0) {
					cancellationType.save((err, cancellationTypeSave) => {
						if (err) {
							fileController.writeLog(req, res, next, 500, err);
							return res.status(500).send(err);
						} else {
							fileController.writeLog(req, res, next, 200, cancellationTypeSave._id);
							getCancellationType(req, res, next, cancellationTypeSave._id);
						}
					});
				} else {
					let message = 'El tipo de cancelación ya existe';
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

function updateCancellationType(req, res, next) {

	initConnectionDB(req.session.database);

	let cancellationTypeId = req.query.id;
	let cancellationType = req.body;

	let user = new User();
	user._id = req.session.user;
	cancellationType.updateUser = user;
	cancellationType.updateDate = moment().format('YYYY-MM-DDTHH:mm:ssZ');
	cancellationType.operationType = 'U';

	if (cancellationType.origin && cancellationType.destination) {

		let json = '{"$and":[{"operationType": {"$ne": "D"}},';
		if (cancellationType.origin._id) {
			json = json + '{"origin": "' + cancellationType.origin._id + '"},';
		} else {
			json = json + '{"origin": "' + cancellationType.origin + '"},';
		}
		if (cancellationType.destination._id) {
			json = json + '{"destination": "' + cancellationType.destination._id + '"},';
		} else {
			json = json + '{"destination": "' + cancellationType.destination + '"},';
		}
		json = json + '{"_id": {"$ne": "' + cancellationTypeId + '"}}]}';
		let where;
		try {
			where = JSON.parse(json);
		} catch (err) {
			fileController.writeLog(req, res, next, 500, json);
			fileController.writeLog(req, res, next, 500, err);
			return res.status(500).send(constants.ERR_SERVER);
		}

		CancellationType.find(where).exec((err, cancellationTypes) => {
			if (err) {
				fileController.writeLog(req, res, next, 500, err);
				return res.status(500).send(constants.ERR_SERVER);
			} else {
				if (!cancellationTypes || cancellationTypes.length === 0) {
					CancellationType.findByIdAndUpdate(cancellationTypeId, cancellationType, (err, cancellationTypeUpdated) => {
						if (err) {
							fileController.writeLog(req, res, next, 500, err);
							return res.status(500).send(err);
						} else {
							fileController.writeLog(req, res, next, 200, cancellationTypeUpdated._id);
							getCancellationType(req, res, next, cancellationTypeUpdated._id);
						}
					});
				} else {
					let message = 'El tipo de cancelación ya existe';
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

function deleteCancellationType(req, res, next) {

	initConnectionDB(req.session.database);

	let cancellationTypeId = req.query.id;

	let user = new User();
	user._id = req.session.user;

	CancellationType.findByIdAndUpdate(cancellationTypeId,
		{
			$set: {
				updateUser: user,
				updateDate: moment().format('YYYY-MM-DDTHH:mm:ssZ'),
				operationType: 'D'
			}
		}, (err, printerDelete) => {
			if (err) {
				fileController.writeLog(req, res, next, 500, err);
				return res.status(500).send(constants.ERR_SERVER);
			} else {
				fileController.writeLog(req, res, next, 200, printerDelete._id);
				return res.status(200).send({ printer: printerDelete });
			}
		});
}

function initConnectionDB(database) {

	const Model = require('../models/model');

	let CancellationTypeSchema = require('./../models/cancellation-type');
	CancellationType = new Model('cancellation-type', {
		schema: CancellationTypeSchema,
		connection: database
	});

	let TransactionTypeSchema = require('./../models/transaction-type');
	TransactionType = new Model('transaction-type', {
		schema: TransactionTypeSchema,
		connection: database
	});

	let UserSchema = require('../models/user');
	User = new Model('user', {
		schema: UserSchema,
		connection: database
	});

}

module.exports = {
	getCancellationType,
	getCancellationTypes,
	saveCancellationType,
	updateCancellationType,
	deleteCancellationType
}