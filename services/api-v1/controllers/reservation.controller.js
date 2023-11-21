'use strict'

let fileController = require('./file.controller');
let constants = require('./../utilities/constants');
const { EJSON } = require('bson');
let moment = require('moment');
moment.locale('es');

let Reservation;
let ReservationType;
let User;

function getReservation(req, res, next, id = undefined) {

	initConnectionDB(req.session.database);

	let reservationId;
	if (id) {
		reservationId = id;
	} else {
		reservationId = req.query.id;
	}

	Reservation.findById(reservationId, (err, reservation) => {
		if (err) {
			fileController.writeLog(req, res, next, 500, err);
			return res.status(500).send(constants.ERR_SERVER);
		} else {
			if (!reservation || reservation.operationType == 'D') {
				fileController.writeLog(req, res, next, 404, constants.NO_DATA_FOUND);
				return res.status(404).send(constants.NO_DATA_FOUN);
			} else {
				ReservationType.populate(reservation, { path: 'type' }, (err, reservation) => {
					if (err) {
						fileController.writeLog(req, res, next, 500, err);
						return res.status(500).send(constants.ERR_SERVER);
					} else {
						fileController.writeLog(req, res, next, 200, reservation);
						return res.status(200).send({ reservation: reservation });
					}
				});
			}
		}
	});
}

function getReservations(req, res, next) {

	initConnectionDB(req.session.database);

	//http://localhost:3000/api/articles/limit=6&skip=0&select=description,code&sort="code":1&where="description":"s"

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

	Reservation.find(where).
		limit(limit).
		select(select).
		sort(sort).
		skip(skip).
		exec((err, reservations) => {
			if (err) {
				fileController.writeLog(req, res, next, 500, err);
				return res.status(500).send(constants.ERR_SERVER);
			} else {
				if (!reservations) {
					fileController.writeLog(req, res, next, 404, constants.NO_DATA_FOUND);
					return res.status(404).send(constants.NO_DATA_FOUN);
				} else if (reservations.length === 0) {
					let message = { message: constants.NO_DATA_FOUND };
					fileController.writeLog(req, res, next, 200, message);
					return res.status(200).send(message);
				} else {
					ReservationType.populate(reservations, { path: 'type' }, (err, reservations) => {
						if (err) {
							fileController.writeLog(req, res, next, 500, err);
							return res.status(500).send(constants.ERR_SERVER);
						} else {
							fileController.writeLog(req, res, next, 200, reservations.length);
							return res.status(200).send({ reservations: reservations });
						}
					});
				}
			}
		});
}

function getReservationsV2(req, res, next) {

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
						if (searchPropertyOfArray(JSON.parse(group), 'reservations')) {
							projectGroup = `{ "reservations": { "$slice": ["$reservations", ${skip}, ${limit}] }`;
						} else {
							projectGroup = `{ "items": { "$slice": ["$items", ${skip}, ${limit}] }`;
						}
						for (let prop of Object.keys(JSON.parse(group))) {
							if (prop !== 'reservations' && prop !== 'items') {
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

	Reservation.aggregate(queryAggregate)
		.then(function (result) {
			fileController.writeLog(req, res, next, 200, result.length);
			if (result.length > 0) {
				if (group && group !== "{}" && group !== {}) {
					return res.status(200).send(result);
				} else {
					return res.status(200).send({ reservations: result });
				}
			} else {
				if (group && group !== "{}" && group !== {}) {
					return res.status(200).send({ count: 0, reservations: [] });
				} else {
					return res.status(200).send({ reservations: [] });
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

function saveReservation(req, res, next) {

	initConnectionDB(req.session.database);

	let reservation = new Reservation();
	let params = req.body;

	reservation.code = params.code;
	reservation.name = params.name;
	reservation.type = params.type;

	let user = new User();
	user._id = req.session.user;
	reservation.creationUser = user;
	reservation.creationDate = moment().format('YYYY-MM-DDTHH:mm:ssZ');
	reservation.operationType = 'C';

	if (reservation.code &&
		reservation.name &&
		reservation.type) {

		let json = '{"$and":[{"operationType": {"$ne": "D"}},';
		json = json + '{"code": ' + reservation.code + '}]}';
		let where;
		try {
			where = JSON.parse(json);
		} catch (err) {
			fileController.writeLog(req, res, next, 500, json);
			fileController.writeLog(req, res, next, 500, err);
			return res.status(500).send(constants.ERR_SERVER);
		}

		Reservation.find(where).exec((err, reservations) => {
			if (err) {
				fileController.writeLog(req, res, next, 500, err);
				return res.status(500).send(constants.ERR_SERVER);
			} else {
				if (!reservations || reservations.length === 0) {
					reservation.save((err, reservationSaved) => {
						if (err) {
							fileController.writeLog(req, res, next, 500, err);
							return res.status(500).send(constants.ERR_SERVER);
						} else {
							getReservation(req, res, next, reservationSaved._id);
						}
					});
				} else {
					let message = 'El empleado \"' + reservation.code + '\" ya existe';
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

function updateReservation(req, res, next) {

	initConnectionDB(req.session.database);

	let reservationId = req.query.id;
	let reservation = req.body;

	let user = new User();
	user._id = req.session.user;
	reservation.updateUser = user;
	reservation.updateDate = moment().format('YYYY-MM-DDTHH:mm:ssZ');
	reservation.operationType = 'U';

	if (reservation.code &&
		reservation.name &&
		reservation.type) {

		let json = '{"$and":[{"operationType": {"$ne": "D"}},';
		json = json + '{"code": "' + reservation.code + '"},';
		json = json + '{"_id": {"$ne": "' + reservationId + '"}}]}';
		let where;
		try {
			where = JSON.parse(json);
		} catch (err) {
			fileController.writeLog(req, res, next, 500, json);
			fileController.writeLog(req, res, next, 500, err);
			return res.status(500).send(constants.ERR_SERVER);
		}

		Reservation.find(where).exec((err, reservations) => {
			if (err) {
				fileController.writeLog(req, res, next, 500, err);
				return res.status(500).send(constants.ERR_SERVER);
			} else {
				if (!reservations || reservations.length === 0) {
					Reservation.findByIdAndUpdate(reservationId, reservation, (err, reservationUpdated) => {
						if (err) {
							fileController.writeLog(req, res, next, 500, err);
							return res.status(500).send(constants.ERR_SERVER);
						} else {
							getReservation(req, res, next, reservationUpdated._id);
						}
					});
				} else {
					let message = 'El empleado \"' + reservation.code + '\" ya existe';
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

function deleteReservation(req, res, next) {

	initConnectionDB(req.session.database);

	let reservationId = req.query.id;

	let user = new User();
	user._id = req.session.user;

	Reservation.findByIdAndUpdate(reservationId,
		{
			$set: {
				updateUser: user,
				updateDate: moment().format('YYYY-MM-DDTHH:mm:ssZ'),
				operationType: 'D'
			}
		}, (err, reservationUpdated) => {
			if (err) {
				fileController.writeLog(req, res, next, 500, err);
				return res.status(500).send(constants.ERR_SERVER);
			} else {
				fileController.writeLog(req, res, next, 200, reservationUpdated._id);
				return res.status(200).send({ reservation: reservationUpdated })
			}
		});
}

function initConnectionDB(database) {

	let ReservationSchema = require('./../models/reservation');
	const Model = require('./../models/model');
	Reservation = new Model('reservation', {
		schema: ReservationSchema,
		connection: database
	});

	let ReservationTypeSchema = require('./../models/reservation-type');
	ReservationType = new Model('reservation-type', {
		schema: ReservationTypeSchema,
		connection: database
	});

	let UserSchema = require('./../models/user');
	User = new Model('user', {
		schema: UserSchema,
		connection: database
	});
}

module.exports = {
	getReservation,
	getReservations,
	getReservationsV2,
	saveReservation,
	updateReservation,
	deleteReservation
}