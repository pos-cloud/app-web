'use strict'

let fileController = require('./file.controller');
let constants = require('../utilities/constants');
const { EJSON } = require('bson');
let moment = require('moment');
moment.locale('es');

let ShipmentMethod;
let User;

function getShipmentMethod(req, res, next, id = undefined) {

	initConnectionDB(req.session.database);

	let shipmentMethodId;
	if (id) {
		shipmentMethodId = id;
	} else {
		shipmentMethodId = req.query.id;
	}

	ShipmentMethod.findById(shipmentMethodId, (err, shipmentMethod) => {
		if (err) {
			fileController.writeLog(req, res, next, 500, err);
			return res.status(500).send(err);
		} else {
			if (!shipmentMethod || shipmentMethod.operationType == 'D') {
				fileController.writeLog(req, res, next, 404, constants.NO_DATA_FOUND);
				return res.status(404).send(constants.NO_DATA_FOUND);
			} else {
				fileController.writeLog(req, res, next, 200, shipmentMethod);
				return res.status(200).send({ shipmentMethod: shipmentMethod });
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

function getShipmentMethods(req, res, next) {

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
						if (searchPropertyOfArray(JSON.parse(group), 'shipmentMethods')) {
							projectGroup = `{ "shipmentMethods": { "$slice": ["$shipmentMethods", ${skip}, ${limit}] }`;
						} else {
							projectGroup = `{ "items": { "$slice": ["$items", ${skip}, ${limit}] }`;
						}
						for (let prop of Object.keys(JSON.parse(group))) {
							if (prop !== 'shipmentMethods' && prop !== 'items') {
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

	ShipmentMethod.aggregate(queryAggregate)
		.then(function (result) {
			fileController.writeLog(req, res, next, 200, result.length);
			if (result.length > 0) {
				if (group && group !== "{}" && group !== {}) {
					return res.status(200).send(result);
				} else {
					return res.status(200).send({ shipmentMethods: result });
				}
			} else {
				if (group && group !== "{}" && group !== {}) {
					return res.status(200).send({ count: 0, shipmentMethods: [] });
				} else {
					return res.status(200).send({ shipmentMethods: [] });
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

function saveShipmentMethod(req, res, next) {

	initConnectionDB(req.session.database);

	let shipmentMethod = new ShipmentMethod();
	let params = req.body;

	shipmentMethod.name = params.name;
	shipmentMethod.wooId = params.wooId;

	let user = new User();
	user._id = req.session.user;
	shipmentMethod.creationUser = user;
	shipmentMethod.creationDate = moment().format('YYYY-MM-DDTHH:mm:ssZ');
	shipmentMethod.operationType = 'C';


	if (shipmentMethod.name) {

		let json = '{"$and":[{"operationType": {"$ne": "D"}},';
		json = json + '{"name": "' + shipmentMethod.name + '"}]}';

		let where;
		try {
			where = JSON.parse(json);
		} catch (err) {
			fileController.writeLog(req, res, next, 500, json);
			fileController.writeLog(req, res, next, 500, err);
			return res.status(500).send(constants.ERR_SERVER);
		}

		ShipmentMethod.find(where).exec((err, shipmentMethods) => {
			if (err) {
				fileController.writeLog(req, res, next, 500, err);
				return res.status(500).send(constants.ERR_SERVER);
			} else {
				if (!shipmentMethods || shipmentMethods.length === 0) {
					shipmentMethod.save((err, shipmentMethodSave) => {
						if (err) {
							fileController.writeLog(req, res, next, 500, err);
							return res.status(500).send(err);
						} else {
							fileController.writeLog(req, res, next, 200, shipmentMethodSave._id);
							getShipmentMethod(req, res, next, shipmentMethodSave._id);
						}
					});
				} else {
					let message = 'El método de envío ya existe';
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

function updateShipmentMethod(req, res, next) {

	initConnectionDB(req.session.database);

	let shipmentMethodId = req.query.id;
	let shipmentMethod = req.body;

	let user = new User();
	user._id = req.session.user;
	shipmentMethod.updateUser = user;
	shipmentMethod.updateDate = moment().format('YYYY-MM-DDTHH:mm:ssZ');
	shipmentMethod.operationType = 'U';


	if (shipmentMethod.name) {

		let json = '{"$and":[{"operationType": {"$ne": "D"}},';
		json = json + '{"$and":[{"name": "' + shipmentMethod.name + '"},';
		json = json + '{"_id": {"$ne": "' + shipmentMethodId + '"}}]}]}';

		let where;
		try {
			where = JSON.parse(json);
		} catch (err) {
			fileController.writeLog(req, res, next, 500, json);
			fileController.writeLog(req, res, next, 500, err);
			return res.status(500).send(constants.ERR_SERVER);
		}

		ShipmentMethod.find(where).exec((err, shipmentMethods) => {
			if (err) {
				fileController.writeLog(req, res, next, 500, err);
				return res.status(500).send(constants.ERR_SERVER);
			} else {
				if (!shipmentMethods || shipmentMethods.length === 0) {
					ShipmentMethod.findByIdAndUpdate(shipmentMethodId, shipmentMethod, (err, shipmentMethodUpdated) => {
						if (err) {
							fileController.writeLog(req, res, next, 500, err);
							return res.status(500).send(err);
						} else {
							fileController.writeLog(req, res, next, 200, shipmentMethodUpdated._id);
							getShipmentMethod(req, res, next, shipmentMethodUpdated._id);
						}
					});
				} else {
					let message = 'El método de envío ya existe';
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

function deleteShipmentMethod(req, res, next) {

	initConnectionDB(req.session.database);

	let shipmentMethodId = req.query.id;

	let user = new User();
	user._id = req.session.user;

	ShipmentMethod.findByIdAndUpdate(shipmentMethodId,
		{
			$set: {
				updateUser: user,
				updateDate: moment().format('YYYY-MM-DDTHH:mm:ssZ'),
				operationType: 'D'
			}
		}, (err, shipmentMethodDelete) => {
			if (err) {
				fileController.writeLog(req, res, next, 500, err);
				return res.status(500).send(constants.ERR_SERVER);
			} else {
				fileController.writeLog(req, res, next, 200, shipmentMethodDelete._id);
				return res.status(200).send({ shipmentMethod: shipmentMethodDelete });
			}
		});
}

function initConnectionDB(database) {

	const Model = require('../models/model');

	let ShipmentMethodSchema = require('./../models/shipment-method');
	ShipmentMethod = new Model('shipment-method', {
		schema: ShipmentMethodSchema,
		connection: database
	});

	let UserSchema = require('../models/user');
	User = new Model('user', {
		schema: UserSchema,
		connection: database
	});

}

module.exports = {
	getShipmentMethod,
	getShipmentMethods,
	saveShipmentMethod,
	updateShipmentMethod,
	deleteShipmentMethod
}