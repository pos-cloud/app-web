'use strict'

let fileController = require('./file.controller');
let constants = require('../utilities/constants');
const { EJSON } = require('bson');
let moment = require('moment');
moment.locale('es');

let Country;
let User;

function getCountry(req, res, next, id = undefined) {

	initConnectionDB(req.session.database);

	let countryId;
	if (id) {
		countryId = id;
	} else {
		countryId = req.query.id;
	}

	Country.findById(countryId, (err, country) => {
		if (err) {
			fileController.writeLog(req, res, next, 500, err);
			return res.status(500).send(err);
		} else {
			if (!country || country.operationType == 'D') {
				fileController.writeLog(req, res, next, 404, constants.NO_DATA_FOUND);
				return res.status(404).send(constants.NO_DATA_FOUND);
			} else {
				fileController.writeLog(req, res, next, 200, country);
				return res.status(200).send({ country: country });
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

function getCountries(req, res, next) {

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
						if (searchPropertyOfArray(JSON.parse(group), 'countries')) {
							projectGroup = `{ "countries": { "$slice": ["$countries", ${skip}, ${limit}] }`;
						} else {
							projectGroup = `{ "items": { "$slice": ["$items", ${skip}, ${limit}] }`;
						}
						for (let prop of Object.keys(JSON.parse(group))) {
							if (prop !== 'countries' && prop !== 'items') {
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

	Country.aggregate(queryAggregate)
		.then(function (result) {
			fileController.writeLog(req, res, next, 200, result.length);
			if (result.length > 0) {
				if (group && group !== "{}" && group !== {}) {
					return res.status(200).send(result);
				} else {
					return res.status(200).send({ countries: result });
				}
			} else {
				if (group && group !== "{}" && group !== {}) {
					return res.status(200).send({ count: 0, countries: [] });
				} else {
					return res.status(200).send({ countries: [] });
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

function saveCountry(req, res, next) {

	initConnectionDB(req.session.database);

	let country = new Country();
	let params = req.body;

	country.code = params.code;
	country.name = params.name;
	country.callingCodes = params.callingCodes;
	country.timezones = params.timezones;
	country.flag = params.flag;
	country.alpha2Code = params.alpha2Code;
	country.alpha3Code = params.alpha3Code;

	let user = new User();
	user._id = req.session.user;
	country.creationUser = user;
	country.creationDate = moment().format('YYYY-MM-DDTHH:mm:ssZ');
	country.operationType = 'C';

	if (country.code &&
		country.name) {

		let json = '{"$and":[{"operationType": {"$ne": "D"}},';
		json = json + '{"$or":[{"code": "' + country.code + '"},';
		json = json + '{"name": "' + country.name + '"}]}]}';

		let where;
		try {
			where = JSON.parse(json);
		} catch (err) {
			fileController.writeLog(req, res, next, 500, json);
			fileController.writeLog(req, res, next, 500, err);
			return res.status(500).send(constants.ERR_SERVER);
		}

		Country.find(where).exec((err, countries) => {
			if (err) {
				fileController.writeLog(req, res, next, 500, err);
				return res.status(500).send(constants.ERR_SERVER);
			} else {
				if (!countries || countries.length === 0) {
					country.save((err, countrySave) => {
						if (err) {
							fileController.writeLog(req, res, next, 500, err);
							return res.status(500).send(err);
						} else {
							fileController.writeLog(req, res, next, 200, countrySave._id);
							getCountry(req, res, next, countrySave._id);
						}
					});
				} else {
					let message = 'El país ' + country.name + ' ya existe.';
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

function updateCountry(req, res, next) {

	initConnectionDB(req.session.database);

	let countryId = req.query.id;
	let country = req.body;

	let user = new User();
	user._id = req.session.user;
	country.updateUser = user;
	country.updateDate = moment().format('YYYY-MM-DDTHH:mm:ssZ');
	country.operationType = 'U';

	if (country.code &&
		country.name) {

		let json = '{"$and":[{"operationType": {"$ne": "D"}},';
		json = json + '{"$or":[{"code": "' + country.code + '"},';
		json = json + '{"name": "' + country.name + '"}]},';
		json = json + '{"_id": {"$ne": "' + countryId + '"}}]}';

		let where;
		try {
			where = JSON.parse(json);
		} catch (err) {
			fileController.writeLog(req, res, next, 500, json);
			fileController.writeLog(req, res, next, 500, err);
			return res.status(500).send(constants.ERR_SERVER);
		}

		Country.find(where).exec((err, countries) => {
			if (err) {
				fileController.writeLog(req, res, next, 500, err);
				return res.status(500).send(constants.ERR_SERVER);
			} else {
				if (!countries || countries.length === 0) {
					Country.findByIdAndUpdate(countryId, country, (err, countryUpdated) => {
						if (err) {
							fileController.writeLog(req, res, next, 500, err);
							return res.status(500).send(err);
						} else {
							fileController.writeLog(req, res, next, 200, countryUpdated._id);
							getCountry(req, res, next, countryUpdated._id);
						}
					});
				} else {
					let message = 'El país ' + country.name + ' ya existe.'
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

function deleteCountry(req, res, next) {

	initConnectionDB(req.session.database);

	let countryId = req.query.id;

	let user = new User();
	user._id = req.session.user;

	Country.findByIdAndUpdate(countryId,
		{
			$set: {
				updateUser: user,
				updateDate: moment().format('YYYY-MM-DDTHH:mm:ssZ'),
				operationType: 'D'
			}
		}, (err, countryDelete) => {
			if (err) {
				fileController.writeLog(req, res, next, 500, err);
				return res.status(500).send(constants.ERR_SERVER);
			} else {
				fileController.writeLog(req, res, next, 200, countryDelete._id);
				return res.status(200).send({ country: countryDelete });
			}
		});
}

function initConnectionDB(database) {

	const Model = require('../models/model');

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
	getCountry,
	getCountries,
	saveCountry,
	updateCountry,
	deleteCountry
}