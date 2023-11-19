'use strict'

let fileController = require('./file.controller');
let constants = require('./../utilities/constants');
const { EJSON } = require('bson');
let moment = require('moment');
moment.locale('es');
let jwt = require('jwt-simple');
let config = require('./../config');

let User;
let Voucher;

function getVoucher(req, res, next, id = undefined) {

	initConnectionDB(req.session.database);

	let voucherId;
	if (id) {
		voucherId = id;
	} else {
		voucherId = req.query.id;
	}

	Voucher.findById(voucherId, (err, voucher) => {
		if (err) {
			fileController.writeLog(req, res, next, 500, err);
			return res.status(500).send(constants.ERR_SERVER);
		} else {
			if (!voucher || voucher.operationType == 'D') {
				fileController.writeLog(req, res, next, 404, constants.NO_DATA_FOUND);
				return res.status(404).send(constants.NO_DATA_FOUND);
			} else {
				fileController.writeLog(req, res, next, 200, voucher);
				return res.status(200).send({ voucher: voucher });
			}
		}
	}).populate({
		path: 'creationUser',
		model: User
	}).populate({
		path: 'updateUser',
		model: User
	});
}

function getVouchers(req, res, next) {

	//http://localhost:3000/api/vouchers/limit=6&skip=0&select=description,code&sort="code":1&where="description":"s"

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

	Voucher.find(where)
		.limit(limit)
		.select(select)
		.sort(sort)
		.skip(skip)
		.populate({
			path: 'updateUser',
			model: User
		}).populate({
			path: 'creationUser',
			model: User
		})
		.exec((err, vouchers) => {
			if (err) {
				fileController.writeLog(req, res, next, 500, err);
				return res.status(500).send(constants.ERR_SERVER);
			} else {
				if (!vouchers) {
					fileController.writeLog(req, res, next, 404, constants.NO_DATA_FOUND);
					return res.status(404).send(constants.NO_DATA_FOUND);
				} else if (vouchers.length === 0) {
					fileController.writeLog(req, res, next, 200, constants.NO_DATA_FOUND);
					return res.status(200).send({ message: constants.NO_DATA_FOUND });
				} else {
					fileController.writeLog(req, res, next, 200, 'Voucher ' + vouchers.length);
					return res.status(200).send({ vouchers: vouchers });
				}
			}
		});
}

function getVouchersV2(req, res, next) {

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
						if (searchPropertyOfArray(JSON.parse(group), 'vouchers')) {
							projectGroup = `{ "vouchers": { "$slice": ["$vouchers", ${skip}, ${limit}] }`;
						} else {
							projectGroup = `{ "items": { "$slice": ["$items", ${skip}, ${limit}] }`;
						}
						for (let prop of Object.keys(JSON.parse(group))) {
							if (prop !== 'vouchers' && prop !== 'items') {
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

	Voucher.aggregate(queryAggregate)
		.then(function (result) {
			fileController.writeLog(req, res, next, 200, result.length);
			if (result.length > 0) {
				if (group && group !== "{}" && group !== {}) {
					return res.status(200).send(result);
				} else {
					return res.status(200).send({ vouchers: result });
				}
			} else {
				if (group && group !== "{}" && group !== {}) {
					return res.status(200).send({ count: 0, vouchers: [] });
				} else {
					return res.status(200).send({ vouchers: [] });
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

function saveVoucher(req, res, next) {

	initConnectionDB(req.session.database);

	let voucher = new Voucher();
	let params = req.body;

	voucher.date = params.date;
	voucher.token = params.token;
	voucher.readings = params.readings;
	voucher.expirationDate = params.expirationDate;

	let user = new User();
	user._id = req.session.user;
	voucher.creationUser = user;
	voucher.creationDate = moment().format('YYYY-MM-DDTHH:mm:ssZ');
	voucher.operationType = 'C';

	if (voucher.date, voucher.token, voucher.expirationDate) {
		voucher.save((err, voucherSaved) => {
			if (err) {
				fileController.writeLog(req, res, next, 500, err);
				return res.status(500).send(constants.ERR_SERVER);
			} else {
				getVoucher(req, res, next, voucherSaved._id);
			}
		});
	} else {
		fileController.writeLog(req, res, next, 200, constants.COMPLETE_ALL_THE_DATA);
		return res.status(200).send({ message: constants.COMPLETE_ALL_THE_DATA });
	}
}

function updateVoucher(req, res, next) {

	initConnectionDB(req.session.database);

	let voucherId = req.query.id;
	let voucher = req.body;

	let user = new User();
	user._id = req.session.user;
	voucher.updateUser = user;
	voucher.operationType = 'U';

	if (voucher.token) {
		Voucher.findByIdAndUpdate(voucherId, voucher, (err, voucherUpdated) => {
			if (err) {
				fileController.writeLog(req, res, next, 500, err);
				return res.status(500).send(constants.ERR_SERVER);
			} else {
				getVoucher(req, res, next, voucherUpdated._id);
			}
		});
	} else {
		fileController.writeLog(req, res, next, 200, constants.COMPLETE_ALL_THE_DATA);
		return res.status(200).send({ message: constants.COMPLETE_ALL_THE_DATA });
	}
}

function deleteVoucher(req, res, next) {

	initConnectionDB(req.session.database);

	let voucherId = req.query.id;

	let user = new User();
	user._id = req.session.user;

	Voucher.findByIdAndUpdate(voucherId,
		{
			$set: {
				updateUser: user,
				updateDate: moment().format('YYYY-MM-DDTHH:mm:ssZ'),
				operationType: 'D'
			}
		}, (err, voucherUpdated) => {
			if (err) {
				fileController.writeLog(req, res, next, 500, err);
				return res.status(500).send(constants.ERR_SERVER);
			} else {
				fileController.writeLog(req, res, next, 200, "Voucher " + voucherUpdated);
				return res.status(200).send({ voucher: voucherUpdated });
			}
		});
}

function generateVoucher(req, res, next) {

	let isValid = true;
	let payload = req.body.voucher;

	if (!payload) {
		isValid = false;
		let message = "Los datos del voucher son obligatorios.";
		return res.status(200).send({ message: message });
	}

	if (isValid) {
		try {
			let encrypt = jwt.encode(payload, config.TOKEN_SECRET);
			fileController.writeLog(req, res, next, 200, encrypt);
			return res.status(200).send({ voucher: encrypt });
		} catch (err) {
			fileController.writeLog(req, res, next, 500, err);
			return res.status(200).send({ message: err.toString() });
		}
	}
}

function verifyVoucher(req, res, next) {
	try {
		let payload = jwt.decode(req.body.voucher, config.TOKEN_SECRET);
		fileController.writeLog(req, res, next, 200, payload);
		return res.status(200).send({ voucher: payload });
	} catch (ex) {
		let message = "El voucher ingresado es incorrecto o ha expirado.";
		return res.status(200).send({ message: message });
	}
}

function initConnectionDB(database) {

	const Model = require('./../models/model');

	let VoucherSchema = require('./../models/voucher');
	Voucher = new Model('voucher', {
		schema: VoucherSchema,
		connection: database
	});

	let UserSchema = require('./../models/user');
	User = new Model('user', {
		schema: UserSchema,
		connection: database
	});
}

module.exports = {
	getVoucher,
	getVouchers,
	getVouchersV2,
	saveVoucher,
	updateVoucher,
	deleteVoucher,
	generateVoucher,
	verifyVoucher
}