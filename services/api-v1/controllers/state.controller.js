'use strict'

let fileController = require('./file.controller');
let constants = require('../utilities/constants');
const { EJSON } = require('bson');
let moment = require('moment');
moment.locale('es');

let State;
let User;
let Country;

function getState(req, res, next, id = undefined) {

	initConnectionDB(req.session.database);

	let stateId;
	if (id) {
		stateId = id;
	} else {
		stateId = req.query.id;
	}

	State.findById(stateId, (err, state) => {
		if (err) {
			fileController.writeLog(req, res, next, 500, err);
			return res.status(500).send(err);
		} else {
			if (!state || state.operationType == 'D') {
				fileController.writeLog(req, res, next, 404, constants.NO_DATA_FOUND);
				return res.status(404).send(constants.NO_DATA_FOUND);
			} else {
				fileController.writeLog(req, res, next, 200, state);
				return res.status(200).send({ state: state });
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
		.populate({
			path: 'country',
			model: Country
		})
}

function getStates(req, res, next) {

	initConnectionDB(req.session.database);

	let queryAggregate = [];
	let group;

	if (req.query && req.query !== {}) {

		let error;

		let project = req.query.project;
		if (project && project !== {} && project !== "{}") {
			try {
				project = JSON.parse(project);

				if (searchPropertyOfArray(project, 'country.')) {
					queryAggregate.push({ $lookup: { from: "countries", foreignField: "_id", localField: "country", as: "country" } });
					queryAggregate.push({ $unwind: { path: "$country", preserveNullAndEmptyArrays: true } });
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
						if (searchPropertyOfArray(JSON.parse(group), 'states')) {
							projectGroup = `{ "states": { "$slice": ["$states", ${skip}, ${limit}] }`;
						} else {
							projectGroup = `{ "items": { "$slice": ["$items", ${skip}, ${limit}] }`;
						}
						for (let prop of Object.keys(JSON.parse(group))) {
							if (prop !== 'states' && prop !== 'items') {
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

	State.aggregate(queryAggregate)
		.then(function (result) {
			fileController.writeLog(req, res, next, 200, result.length);
			if (result.length > 0) {
				if (group && group !== "{}" && group !== {}) {
					return res.status(200).send(result);
				} else {
					return res.status(200).send({ states: result });
				}
			} else {
				if (group && group !== "{}" && group !== {}) {
					return res.status(200).send({ count: 0, states: [] });
				} else {
					return res.status(200).send({ states: [] });
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

function saveState(req, res, next) {

	initConnectionDB(req.session.database);

	let state = new State();
	let params = req.body;

	state.code = params.code;
	state.name = params.name;
	state.country = params.country;

	let user = new User();
	user._id = req.session.user;
	state.creationUser = user;
	state.creationDate = moment().format('YYYY-MM-DDTHH:mm:ssZ');
	state.operationType = 'C';

	if (state.code &&
		state.name &&
		state.country) {

		let json = '{"$and":[{"operationType": {"$ne": "D"}},';
		json = json + '{"$or":[{"code": "' + state.code + '"},';
		json = json + '{"name": "' + state.name + '"}]},';
		if (state.country._id) {
			json = json + '{"country": "' + state.country._id + '"}]}';
		} else {
			json = json + '{"country": "' + state.country + '"}]}';
		}

		let where;
		try {
			where = JSON.parse(json);
		} catch (err) {
			fileController.writeLog(req, res, next, 500, json);
			fileController.writeLog(req, res, next, 500, err);
			return res.status(500).send(constants.ERR_SERVER);
		}

		State.find(where).exec((err, states) => {
			if (err) {
				fileController.writeLog(req, res, next, 500, err);
				return res.status(500).send(constants.ERR_SERVER);
			} else {
				if (!states || states.length === 0) {
					state.save((err, stateSave) => {
						if (err) {
							fileController.writeLog(req, res, next, 500, err);
							return res.status(500).send(err);
						} else {
							fileController.writeLog(req, res, next, 200, stateSave._id);
							getState(req, res, next, stateSave._id);
						}
					});
				} else {
					let message = 'El estado ya existe';
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

function updateState(req, res, next) {

	initConnectionDB(req.session.database);

	let stateId = req.query.id;
	let state = req.body;

	let user = new User();
	user._id = req.session.user;
	state.updateUser = user;
	state.updateDate = moment().format('YYYY-MM-DDTHH:mm:ssZ');
	state.operationType = 'U';


	if (state.country &&
		state.name) {

		let json = '{"$and":[{"operationType": {"$ne": "D"}},';
		json = json + '{"$or":[{"code": "' + state.code + '"},';
		json = json + '{"name": "' + state.name + '"}]},';
		if (state.country._id) {
			json = json + '{"country": "' + state.country._id + '"},';
		} else {
			json = json + '{"country": "' + state.country + '"},';
		}
		json = json + '{"_id": {"$ne": "' + stateId + '"}}]}';


		let where;
		try {
			where = JSON.parse(json);
		} catch (err) {
			fileController.writeLog(req, res, next, 500, json);
			fileController.writeLog(req, res, next, 500, err);
			return res.status(500).send(constants.ERR_SERVER);
		}

		State.find(where).exec((err, states) => {
			if (err) {
				fileController.writeLog(req, res, next, 500, err);
				return res.status(500).send(constants.ERR_SERVER);
			} else {
				if (!states || states.length === 0) {
					State.findByIdAndUpdate(stateId, state, (err, stateUpdated) => {
						if (err) {
							fileController.writeLog(req, res, next, 500, err);
							return res.status(500).send(err);
						} else {
							fileController.writeLog(req, res, next, 200, stateUpdated._id);
							getState(req, res, next, stateUpdated._id);
						}
					});
				} else {
					let message = 'El estado ya existe';
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

function deleteState(req, res, next) {

	initConnectionDB(req.session.database);

	let stateId = req.query.id;

	let user = new User();
	user._id = req.session.user;

	State.findByIdAndUpdate(stateId,
		{
			$set: {
				updateUser: user,
				updateDate: moment().format('YYYY-MM-DDTHH:mm:ssZ'),
				operationType: 'D'
			}
		}, (err, stateDelete) => {
			if (err) {
				fileController.writeLog(req, res, next, 500, err);
				return res.status(500).send(constants.ERR_SERVER);
			} else {
				fileController.writeLog(req, res, next, 200, stateDelete._id);
				return res.status(200).send({ state: stateDelete });
			}
		});
}

function initConnectionDB(database) {

	const Model = require('../models/model');

	let StateSchema = require('./../models/state');
	State = new Model('state', {
		schema: StateSchema,
		connection: database
	});

	let CountrySchema = require('./../models/country');
	Country = new Model('country', {
		schema: CountrySchema,
		connection: database
	});

	let UserSchema = require('../models/user');
	User = new Model('user', {
		schema: UserSchema,
		connection: database
	});

}

module.exports = {
	getState,
	getStates,
	saveState,
	updateState,
	deleteState
}