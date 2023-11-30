'use strict'

let fileController = require('./file.controller');
let constants = require('../utilities/constants');
const { EJSON } = require('bson');
let moment = require('moment');
moment.locale('es');

let MovementOfCancellation;
let User;
let Transaction;

function getMovementOfCancellation(req, res, next, id = undefined) {

	initConnectionDB(req.session.database);

	let movementOfCancellationId;
	if (id) {
		movementOfCancellationId = id;
	} else {
		movementOfCancellationId = req.query.id;
	}

	MovementOfCancellation.findById(movementOfCancellationId, (err, movementOfCancellation) => {
		if (err) {
			fileController.writeLog(req, res, next, 500, err);
			return res.status(500).send(err);
		} else {
			if (!movementOfCancellation || movementOfCancellation.operationType == 'D') {
				fileController.writeLog(req, res, next, 404, constants.NO_DATA_FOUND);
				return res.status(404).send(constants.NO_DATA_FOUND);
			} else {
				Transaction.populate(movementOfCancellation, { path: 'transactionOrigin' }, (err, movementOfCancellation) => {
					if (err) {
						fileController.writeLog(req, res, next, 500, err);
						return res.status(500).send(constants.ERR_SERVER);
					} else if (!movementOfCancellation) {
						fileController.writeLog(req, res, next, 404, constants.NO_DATA_FOUND);
						return res.status(404).send(constants.NO_DATA_FOUND);
					} else {
						Transaction.populate(movementOfCancellation, { path: 'transactionDestination' }, (err, movementOfCancellation) => {
							if (err) {
								fileController.writeLog(req, res, next, 500, err);
								return res.status(500).send(constants.ERR_SERVER);
							} else if (!movementOfCancellation) {
								fileController.writeLog(req, res, next, 404, constants.NO_DATA_FOUND);
								return res.status(404).send(constants.NO_DATA_FOUND);
							} else {
								fileController.writeLog(req, res, next, 200, movementOfCancellation);
								return res.status(200).send({ movementOfCancellation: movementOfCancellation });
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

function getMovementsOfCancellations(req, res, next) {

	initConnectionDB(req.session.database);

	let queryAggregate = [];
	let group;

	if (req.query && req.query !== {}) {

		let error;

		let project = req.query.project;
		if (project && project !== {} && project !== "{}") {
			try {
				project = JSON.parse(project);

				if (searchPropertyOfArray(project, 'transactionOrigin.')) {
					queryAggregate.push({ $lookup: { from: "transactions", foreignField: "_id", localField: "transactionOrigin", as: "transactionOrigin" } });
					queryAggregate.push({ $unwind: { path: "$transactionOrigin", preserveNullAndEmptyArrays: true } });

					if (searchPropertyOfArray(project, 'transactionOrigin.employeeClosing.')) {
						queryAggregate.push({ $lookup: { from: "employees", foreignField: "_id", localField: "transactionOrigin.employeeClosing", as: "transactionOrigin.employeeClosing" } });
						queryAggregate.push({ $unwind: { path: "$transactionOrigin.employeeClosing", preserveNullAndEmptyArrays: true } });
					}
					if (searchPropertyOfArray(project, 'transactionOrigin.type.')) {
						queryAggregate.push({ $lookup: { from: "transaction-types", foreignField: "_id", localField: "transactionOrigin.type", as: "transactionOrigin.type" } });
						queryAggregate.push({ $unwind: { path: "$transactionOrigin.type", preserveNullAndEmptyArrays: true } });
					}

					if (searchPropertyOfArray(project, 'transactionOrigin.company.')) {
						queryAggregate.push({ $lookup: { from: "companies", foreignField: "_id", localField: "transactionOrigin.company", as: "transactionOrigin.company" } });
						queryAggregate.push({ $unwind: { path: "$transactionOrigin.company", preserveNullAndEmptyArrays: true } });
						
						if (searchPropertyOfArray(project, 'transactionOrigin.company.state.')) {
							queryAggregate.push({ $lookup: { from: "states", foreignField: "_id", localField: "transactionOrigin.company.state", as: "transactionOrigin.company.state" } });
							queryAggregate.push({ $unwind: { path: "$transactionOrigin.company.state", preserveNullAndEmptyArrays: true } });
						}

						if (searchPropertyOfArray(project, 'transactionOrigin.company.employee.')) {
							queryAggregate.push({ $lookup: { from: "employees", foreignField: "_id", localField: "transactionOrigin.company.employee", as: "transactionOrigin.company.employee" } });
							queryAggregate.push({ $unwind: { path: "$transactionOrigin.company.employee", preserveNullAndEmptyArrays: true } });
						}

						if (searchPropertyOfArray(project, 'transactionOrigin.company.state.')) {
							queryAggregate.push({ $lookup: { from: "states", foreignField: "_id", localField: "transactionOrigin.company.state", as: "transactionOrigin.company.state" } });
							queryAggregate.push({ $unwind: { path: "$transactionOrigin.company.state", preserveNullAndEmptyArrays: true } });
						}
					}
				}

				if (searchPropertyOfArray(project, 'transactionDestination.')) {
					queryAggregate.push({ $lookup: { from: "transactions", foreignField: "_id", localField: "transactionDestination", as: "transactionDestination" } });
					queryAggregate.push({ $unwind: { path: "$transactionDestination", preserveNullAndEmptyArrays: true } });

					if (searchPropertyOfArray(project, 'transactionDestination.type.')) {
						queryAggregate.push({ $lookup: { from: "transaction-types", foreignField: "_id", localField: "transactionDestination.type", as: "transactionDestination.type" } });
						queryAggregate.push({ $unwind: { path: "$transactionDestination.type", preserveNullAndEmptyArrays: true } });
                    }
                    
                    if (searchPropertyOfArray(project, 'transactionDestination.company.')) {
						queryAggregate.push({ $lookup: { from: "companies", foreignField: "_id", localField: "transactionDestination.company", as: "transactionDestination.company" } });
                        queryAggregate.push({ $unwind: { path: "$transactionDestination.company", preserveNullAndEmptyArrays: true } });
                        
                        if (searchPropertyOfArray(project, 'transactionDestination.company.state.')) {
                            queryAggregate.push({ $lookup: { from: "states", foreignField: "_id", localField: "transactionDestination.company.state", as: "transactionDestination.company.state" } });
                            queryAggregate.push({ $unwind: { path: "$transactionDestination.company.state", preserveNullAndEmptyArrays: true } });
                        }

                        if (searchPropertyOfArray(project, 'transactionDestination.company.group.')) {
                            queryAggregate.push({ $lookup: { from: "company-groups", foreignField: "_id", localField: "transactionDestination.company.group", as: "transactionDestination.company.group" } });
                            queryAggregate.push({ $unwind: { path: "$transactionDestination.company.group", preserveNullAndEmptyArrays: true } });
                        }
					}
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
						if (searchPropertyOfArray(JSON.parse(group), 'movementsOfCancellations')) {
							projectGroup = `{ "movementsOfCancellations": { "$slice": ["$movementsOfCancellations", ${skip}, ${limit}] }`;
						} else {
							projectGroup = `{ "items": { "$slice": ["$items", ${skip}, ${limit}] }`;
						}
						for (let prop of Object.keys(JSON.parse(group))) {
							if (prop !== 'movementsOfCancellations' && prop !== 'items') {
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

	MovementOfCancellation.aggregate(queryAggregate)
    .allowDiskUse(true)
		.then(function (result) {
			fileController.writeLog(req, res, next, 200, result.length);
			if (result.length > 0) {
				if (group && group !== "{}" && group !== {}) {
					return res.status(200).send(result);
				} else {
					return res.status(200).send({ movementsOfCancellations: result });
				}
			} else {
				if (group && group !== "{}" && group !== {}) {
					return res.status(200).send({ count: 0, movementsOfCancellations: [] });
				} else {
					return res.status(200).send({ movementsOfCancellations: [] });
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

function saveMovementOfCancellation(req, res, next) {

	initConnectionDB(req.session.database);

	let movementOfCancellation = new MovementOfCancellation();
	let params = req.body;

	movementOfCancellation.transactionOrigin = params.transactionOrigin;
    movementOfCancellation.transactionDestination = params.transactionDestination;
    movementOfCancellation.type = params.type;
	movementOfCancellation.balance = params.balance;

	let user = new User();
	user._id = req.session.user;
	movementOfCancellation.creationUser = user;
	movementOfCancellation.creationDate = moment().format('YYYY-MM-DDTHH:mm:ssZ');
	movementOfCancellation.operationType = 'C';

	movementOfCancellation.save((err, movementOfCancellationSave) => {
		if (err) {
			fileController.writeLog(req, res, next, 500, err);
			return res.status(500).send(err);
		} else {
			fileController.writeLog(req, res, next, 200, movementOfCancellationSave._id);
			getMovementOfCancellation(req, res, next, movementOfCancellationSave._id);
		}
	})
}

function saveMovementsOfCancellations(req, res, next) {

	initConnectionDB(req.session.database);

	let params = req.body;
	let movementsOfCancellations = params.movementsOfCancellations;

	MovementOfCancellation.create(movementsOfCancellations, (err, movementsOfCancellationsSaved) => {
		if (err) {
			fileController.writeLog(req, res, next, 500, err);
			return res.status(500).send(constants.ERR_SERVER);
		} else {
			fileController.writeLog(req, res, next, 200, movementsOfCancellationsSaved);
			return res.status(200).send({ movementsOfCancellations: movementsOfCancellationsSaved });
		}
	});
}

function updateMovementOfCancellation(req, res, next) {

	initConnectionDB(req.session.database);

	let movementOfCancellationId = req.query.id;
	let movementOfCancellation = req.body;

	let user = new User();
	user._id = req.session.user;
	movementOfCancellation.updateUser = user;
	movementOfCancellation.updateDate = moment().format('YYYY-MM-DDTHH:mm:ssZ');
	movementOfCancellation.operationType = 'U';

	MovementOfCancellation.findByIdAndUpdate(movementOfCancellationId, movementOfCancellation, (err, movementOfCancellationUpdated) => {
		if (err) {
			fileController.writeLog(req, res, next, 500, err);
			return res.status(500).send(err);
		} else {
			fileController.writeLog(req, res, next, 200, movementOfCancellationUpdated._id);
			getMovementOfCancellation(req, res, next, movementOfCancellationUpdated._id);
		}
	})
}

function deleteMovementOfCancellation(req, res, next) {

	initConnectionDB(req.session.database);

	let movementOfCancellationId = req.query.id;

	let user = new User();
	user._id = req.session.user;

	MovementOfCancellation.findByIdAndUpdate(movementOfCancellationId,
		{
			$set: {
				updateUser: user,
				updateDate: moment().format('YYYY-MM-DDTHH:mm:ssZ'),
				operationType: 'D'
			}
		}, (err, movementOfCancellationUpdated) => {
			if (err) {
				fileController.writeLog(req, res, next, 500, err);
				return res.status(500).send(err);
			} else {
				fileController.writeLog(req, res, next, 200, movementOfCancellationUpdated);
				return res.status(200).send({ movementOfCancellation: movementOfCancellationUpdated });
			}
		})
}

function deleteMovementsOfCancellations(req, res, next) {

	initConnectionDB(req.session.database);

	let query = req.query.query;

	let user = new User();
	user._id = req.session.user;

	let where = JSON.parse(query);
	let set = JSON.parse('{ "$set": {   "updateUser": "' + user._id +
		'", "updateDate": "' + moment().format('YYYY-MM-DDTHH:mm:ssZ') +
		'","operationType": "D"}}'
	);

	MovementOfCancellation.update(where, set, { multi: true }, (err, movementsOfCancellationsUpdated) => {
		if (err) {
			fileController.writeLog(req, res, next, 500, err);
			return res.status(500).send(constants.ERR_SERVER);
		} else {
			req.query.sort = '{ "_id": 1 }';
			fileController.writeLog(req, res, next, 200, movementsOfCancellationsUpdated);
			getMovementsOfCancellations(req, res, next);
		}
	});
}

function initConnectionDB(database) {

	const Model = require('../models/model');

	let MovementOfCancellationSchema = require('./../models/movement-of-cancellation');
	MovementOfCancellation = new Model('movements-of-cancellation', {
		schema: MovementOfCancellationSchema,
		connection: database
	});

	let UserSchema = require('../models/user');
	User = new Model('user', {
		schema: UserSchema,
		connection: database
	});

	let TransactionSchema = require('./../models/transaction');
	Transaction = new Model('transaction', {
		schema: TransactionSchema,
		connection: database
	});
}

module.exports = {
	getMovementOfCancellation,
	getMovementsOfCancellations,
	saveMovementOfCancellation,
	saveMovementsOfCancellations,
	updateMovementOfCancellation,
	deleteMovementOfCancellation,
	deleteMovementsOfCancellations
}