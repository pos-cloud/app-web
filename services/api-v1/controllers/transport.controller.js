'use strict'

let fileController = require('./file.controller');
let constants = require('../utilities/constants');
const { EJSON } = require('bson');
let moment = require('moment');
moment.locale('es');

let Transport;
let User;

function getTransport(req, res, next, id = undefined) {

	initConnectionDB(req.session.database);

	let transportId;
	if (id) {
		transportId = id;
	} else {
		transportId = req.query.id;
	}

	Transport.findById(transportId, (err, transport) => {
		if (err) {
			fileController.writeLog(req, res, next, 500, err);
			return res.status(500).send(err);
		} else {
			if (!transport || transport.operationType == 'D') {
				fileController.writeLog(req, res, next, 404, constants.NO_DATA_FOUND);
				return res.status(404).send(constants.NO_DATA_FOUND);
			} else if (transport === undefined) {
				fileController.writeLog(req, res, next, 200, constants.NO_DATA_FOUND);
				return res.status(200).send({ message: constants.NO_DATA_FOUND });
			} else {
				fileController.writeLog(req, res, next, 200, transport);
				return res.status(200).send({ transport: transport });
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

function getTransports(req, res, next) {

	initConnectionDB(req.session.database);

	let queryAggregate = [];
	let group;

	if (req.query && req.query !== {}) {

		let error;

		let sort = req.query.sort;
		if (sort && sort !== {} && sort !== "{}") {
			try {
				queryAggregate.push({ $sort: JSON.parse(sort) });
			} catch (err) {
				error = err;
			}
		}

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

				queryAggregate.push({ $project: project });
			} catch (err) {
				error = err;
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
						if (searchPropertyOfArray(JSON.parse(group), 'transports')) {
							projectGroup = `{ "transports": { "$slice": ["$transports", ${skip}, ${limit}] }`;
						} else {
							projectGroup = `{ "items": { "$slice": ["$items", ${skip}, ${limit}] }`;
						}
						for (let prop of Object.keys(JSON.parse(group))) {
							if (prop !== 'transports' && prop !== 'items') {
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

	Transport.aggregate(queryAggregate)
		.then(function (result) {
			fileController.writeLog(req, res, next, 200, result.length);
			if (result.length > 0) {
				if (group && group !== "{}" && group !== {}) {
					return res.status(200).send(result[0]);
				} else {
					return res.status(200).send({ transports: result });
				}
			} else {
				if (group && group !== "{}" && group !== {}) {
					return res.status(200).send({ count: 0, transports: [] });
				} else {
					return res.status(200).send({ transports: [] });
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

function saveTransport(req, res, next) {


	initConnectionDB(req.session.database);

	let transport = new Transport();
	let params = req.body;

	transport.code = params.code;
	transport.name = params.name;
	transport.fantasyName = params.fantasyName;
	transport.vatCondition = params.vatCondition;
	transport.identificationType = params.identificationType;
	transport.identificationValue = params.identificationValue;
	transport.grossIncome = params.grossIncome;
	transport.address = params.address;
	transport.city = params.city;
	transport.phones = params.phones;
	transport.emails = params.emails;



	let user = new User();
	user._id = req.session.user;
	transport.creationUser = user;
	transport.creationDate = moment().format('YYYY-MM-DDTHH:mm:ssZ');
	transport.operationType = 'C';

	if (transport.name) {

		let json = '{"$and":[{"operationType": {"$ne": "D"}},';
		json = json + '{"name": "' + transport.name + '"}]}';

		let where;
		try {
			where = JSON.parse(json);
		} catch (err) {
			fileController.writeLog(req, res, next, 500, json);
			fileController.writeLog(req, res, next, 500, err);
			return res.status(500).send(constants.ERR_SERVER);
		}

		Transport.find(where).exec((err, transports) => {
			if (err) {
				fileController.writeLog(req, res, next, 500, err);
				return res.status(500).send(constants.ERR_SERVER);
			} else {
				if (!transports || transports.length === 0) {
					transport.save((err, transportSave) => {
						if (err) {
							fileController.writeLog(req, res, next, 500, err);
							return res.status(500).send(err);
						} else {
							fileController.writeLog(req, res, next, 200, transportSave._id);
							getTransport(req, res, next, transportSave._id);
						}
					});
				} else {
					let message = 'El país ya existe';
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

function updateTransport(req, res, next) {

	initConnectionDB(req.session.database);

	let transportId = req.query.id;
	let transport = req.body;

	let user = new User();
	user._id = req.session.user;
	transport.updateUser = user;
	transport.updateDate = moment().format('YYYY-MM-DDTHH:mm:ssZ');
	transport.operationType = 'U';

	if (transport.name) {

		let json = '{"$and":[{"operationType": {"$ne": "D"}},';
		json = json + '{"name": "' + transport.name + '"},';
		json = json + '{"_id": {"$ne": "' + transportId + '"}}]}';

		let where;
		try {
			where = JSON.parse(json);
		} catch (err) {
			fileController.writeLog(req, res, next, 500, json);
			fileController.writeLog(req, res, next, 500, err);
			return res.status(500).send(constants.ERR_SERVER);
		}

		Transport.find(where).exec((err, transports) => {
			if (err) {
				fileController.writeLog(req, res, next, 500, err);
				return res.status(500).send(constants.ERR_SERVER);
			} else {
				if (!transports || transports.length === 0) {
					Transport.findByIdAndUpdate(transportId, transport, (err, transportUpdated) => {
						if (err) {
							fileController.writeLog(req, res, next, 500, err);
							return res.status(500).send(err);
						} else {
							fileController.writeLog(req, res, next, 200, transportUpdated._id);
							getTransport(req, res, next, transportUpdated._id);
						}
					});
				} else {
					let message = 'El país ya existe';
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

function deleteTransport(req, res, next) {

	initConnectionDB(req.session.database);

	let transportId = req.query.id;

	let user = new User();
	user._id = req.session.user;

	Transport.findByIdAndUpdate(transportId,
		{
			updateUser: user,
			updateDate: moment().format('YYYY-MM-DDTHH:mm:ssZ'),
			operationType: 'D'
		}, (err, transportDelete) => {
			if (err) {
				fileController.writeLog(req, res, next, 500, err);
				return res.status(500).send(constants.ERR_SERVER);
			} else {
				fileController.writeLog(req, res, next, 200, transportDelete._id);
				return res.status(200).send({ transport: transportDelete });
			}
		});
}

function initConnectionDB(database) {

	const Model = require('../models/model');

	let TransportSchema = require('./../models/transport');
	Transport = new Model('transport', {
		schema: TransportSchema,
		connection: database
	});

	let UserSchema = require('../models/user');
	User = new Model('user', {
		schema: UserSchema,
		connection: database
	});

}

module.exports = {
	getTransport,
	getTransports,
	saveTransport,
	updateTransport,
	deleteTransport
}