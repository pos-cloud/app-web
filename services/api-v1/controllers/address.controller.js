'use strict'

let fileController = require('./file.controller');
let constants = require('./../utilities/constants');
const { EJSON } = require('bson');
let moment = require('moment');
moment.locale('es');

let Address;
let User;

function getAddress(req, res, next, id = undefined) {

	initConnectionDB(req.session.database);

	let addressId;
	if (id) {
		addressId = id;
	} else {
		addressId = req.query.id;
	}

	Address.findById(addressId, (err, address) => {
		if (err) {
			fileController.writeLog(req, res, next, 500, err);
			return res.status(500).send(constants.ERR_SERVER);
		} else {
			if (!address || address.operationType == 'D') {
				fileController.writeLog(req, res, next, 404, constants.NO_DATA_FOUND);
				return res.status(404).send(constants.NO_DATA_FOUND);
			} else {
				fileController.writeLog(req, res, next, 200, address);
				return res.status(200).send({ address: address });
			}
		}
	});

}

function getAddresses(req, res, next) {

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
						if (searchPropertyOfArray(JSON.parse(group), 'addresses')) {
							projectGroup = `{ "addresses": { "$slice": ["$addresses", ${skip}, ${limit}] }`;
						} else {
							projectGroup = `{ "items": { "$slice": ["$items", ${skip}, ${limit}] }`;
						}
						for (let prop of Object.keys(JSON.parse(group))) {
							if (prop !== 'addresses' && prop !== 'items') {
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

	Address.aggregate(queryAggregate)
		.then(function (result) {
			fileController.writeLog(req, res, next, 200, result.length);
			if (result.length > 0) {
				if (group && group !== "{}" && group !== {}) {
					return res.status(200).send(result);
				} else {
					return res.status(200).send({ addresses: result });
				}
			} else {
				if (group && group !== "{}" && group !== {}) {
					return res.status(200).send({ count: 0, addresses: [] });
				} else {
					return res.status(200).send({ addresses: [] });
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

function saveAddress(req, res, next) {

	initConnectionDB(req.session.database);

	let address = new Address();
	let params = req.body;

	address.type = params.type;
	address.name = params.name;
	address.number = params.number;
	address.floor = params.floor;
	address.flat = params.flat;
	address.postalCode = params.postalCode;
	address.city = params.city;
	address.state = params.state;
	address.country = params.country;
	address.latitude = params.latitude;
	address.longitude = params.longitude;
	address.observation = params.observation;
	address.company = params.company;
	address.forBilling = params.forBilling;
	address.forShipping = params.forShipping;

	if (req.session) {
		let user = new User();
		user._id = req.session.user;
		address.creationUser = user;
	}
	address.creationDate = moment().format('YYYY-MM-DDTHH:mm:ssZ');
	address.operationType = 'C';
	if (
		address.name &&
		address.number
	) {

		let json = '{"$and":[{"operationType": {"$ne": "D"}},';
		json = json + '{"type": "' + address.type + '"},';
		json = json + '{"code": "' + address.code + '"}]}';
		let where;
		try {
			where = JSON.parse(json);
		} catch (err) {
			fileController.writeLog(req, res, next, 500, json);
			fileController.writeLog(req, res, next, 500, err);
			return res.status(500).send(constants.ERR_SERVER);
		}


		Address.find(where).exec((err, addresses) => {
			if (err) {
				fileController.writeLog(req, res, next, 500, err);
				return res.status(500).send(constants.ERR_SERVER);
			} else {
				if (!addresses || addresses.length === 0) {
					address.save((err, addressSaved) => {
						if (err) {
							fileController.writeLog(req, res, next, 500, err);
							return res.status(500).send(constants.ERR_SERVER);
						} else {
							getAddress(req, res, next, addressSaved._id);
						}
					});
				} else {
					let message = 'La empresa "' + address.code + '" ya existe';
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

function updateAddress(req, res, next) {

	initConnectionDB(req.session.database);

	let addressId = req.query.id;
	let address = req.body;

	let user = new User();
	user._id = req.session.user;
	address.updateUser = user;
	address.updateDate = moment().format('YYYY-MM-DDTHH:mm:ssZ');
	address.operationType = 'U';

	if (
		address.name &&
		address.number
	) {
		Address.findByIdAndUpdate(addressId, address, (err, addressUpdated) => {
			if (err) {
				fileController.writeLog(req, res, next, 500, err);
				return res.status(500).send(constants.ERR_SERVER);
			} else {
				getAddress(req, res, next, addressUpdated._id);
			}
		});
	} else {
		fileController.writeLog(req, res, next, 200, constants.COMPLETE_ALL_THE_DATA);
		return res.status(200).send({ message: constants.COMPLETE_ALL_THE_DATA });
	}
}

function deleteAddress(req, res, next) {

	initConnectionDB(req.session.database);

	let addressId = req.query.id;

	let user = new User();
	user._id = req.session.user;

	Address.findByIdAndUpdate(addressId,
		{
			$set: {
				updateUser: user,
				updateDate: moment().format('YYYY-MM-DDTHH:mm:ssZ'),
				operationType: 'D'
			}
		}, (err, addressUpdated) => {
			if (err) {
				fileController.writeLog(req, res, next, 500, err);
				return res.status(500).send(constants.ERR_SERVER);
			} else {
				fileController.writeLog(req, res, next, 200, addressUpdated._id);
				return res.status(200).send({ address: addressUpdated });
			}
		});
}

function initConnectionDB(database) {

	const Model = require('./../models/model');

	let AddressSchema = require('./../models/address');
	Address = new Model('address', {
		schema: AddressSchema,
		connection: database
	});

	let UserSchema = require('./../models/user');
	User = new Model('user', {
		schema: UserSchema,
		connection: database
	});
}

module.exports = {
	getAddress,
	getAddresses,
	saveAddress,
	updateAddress,
	deleteAddress,
} 