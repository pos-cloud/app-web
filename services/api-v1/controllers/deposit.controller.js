'use strict'

let fileController = require('./file.controller');
let constants = require('./../utilities/constants');
const { EJSON } = require('bson');
let moment = require('moment');
moment.locale('es');

let User;
let Deposit;
let Branch;

// AWAIT
function get(req, res, next, id = undefined) {

	return new Promise((resolve, reject) => {

		initConnectionDB(req.session.database);

		let depositId;
		if (id) {
			depositId = id;
		} else {
			depositId = req.query.id;
		}

		Deposit.findById(depositId, (err, deposit) => {
			if (err) {
				reject(err);
			} else {
				if (!deposit) {
					reject(constants.NO_DATA_FOUND);
				} else {
					resolve(deposit);
				}
			}
		}).populate({
			path: 'branch',
			model: Branch
		});
	});
}

// SIN AWAIT
function getDeposit(req, res, next, id = undefined) {

	initConnectionDB(req.session.database);

	let depositId;
	if (id) {
		depositId = id;
	} else {
		depositId = req.query.id;
	}

	Deposit.findById(depositId, (err, deposit) => {
		if (err) {
			fileController.writeLog(req, res, next, 500, err);
			return res.status(500).send(constants.ERR_SERVER);
		} else {
			Branch.populate(deposit, { path: 'branch' }, (err, deposit) => {
				if (err) {
					fileController.writeLog(req, res, next, 500, err);
					return res.status(500).send(constants.ERR_SERVER);
				} else if (!deposit) {
					fileController.writeLog(req, res, next, 404, constants.NO_DATA_FOUND);
					return res.status(404).send(constants.NO_DATA_FOUND);
				} else {
					fileController.writeLog(req, res, next, 200, deposit);
					return res.status(200).send({ deposit: deposit });
				}
			});
		}
	}).populate({
		path: 'branch',
		model: Branch
	});
}

function getDeposits(req, res, next) {

	//http://localhost:3000/api/deposits/limit=6&skip=0&select=name,code&sort="code":1&where="name":"s"

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

	Deposit.find(where).
		limit(limit).
		select(select).
		sort(sort).
		skip(skip).
		exec((err, deposits) => {
			if (err) {
				fileController.writeLog(req, res, next, 500, err);
				return res.status(500).send(constants.ERR_SERVER);
			} else {
				if (!deposits) {
					fileController.writeLog(req, res, next, 404, constants.NO_DATA_FOUND);
					return res.status(404).send(constants.NO_DATA_FOUND);
				} else if (deposits.length === 0) {
					fileController.writeLog(req, res, next, 200, constants.NO_DATA_FOUND);
					return res.status(200).send({ message: constants.NO_DATA_FOUND });
				} else {
					Branch.populate(deposits, { path: 'branch' }, (err, deposits) => {
						if (err) {
							fileController.writeLog(req, res, next, 500, err);
							return res.status(500).send(constants.ERR_SERVER);
						} else if (!deposits) {
							fileController.writeLog(req, res, next, 404, constants.NO_DATA_FOUND);
							return res.status(404).send(constants.NO_DATA_FOUND);
						} else {
							fileController.writeLog(req, res, next, 200, deposits.length);
							return res.status(200).send({ deposits: deposits });
						}
					});
				}
			}
		});
}

function getDepositsV2(req, res, next) {

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
						if (searchPropertyOfArray(JSON.parse(group), 'deposits')) {
							projectGroup = `{ "deposits": { "$slice": ["$deposits", ${skip}, ${limit}] }`;
						} else {
							projectGroup = `{ "items": { "$slice": ["$items", ${skip}, ${limit}] }`;
						}
						for (let prop of Object.keys(JSON.parse(group))) {
							if (prop !== 'deposits' && prop !== 'items') {
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

	Deposit.aggregate(queryAggregate)
		.then(function (result) {
			fileController.writeLog(req, res, next, 200, result.length);
			if (result.length > 0) {
				if (group && group !== "{}" && group !== {}) {
					return res.status(200).send(result);
				} else {
					return res.status(200).send({ deposits: result });
				}
			} else {
				if (group && group !== "{}" && group !== {}) {
					return res.status(200).send({ count: 0, deposits: [] });
				} else {
					return res.status(200).send({ deposits: [] });
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

function saveDeposit(req, res, next) {

	initConnectionDB(req.session.database);

	let deposit = new Deposit();
	let params = req.body;

	deposit.name = params.name;
	deposit.capacity = params.capacity;
	deposit.branch = params.branch;
	deposit.default = params.default;

	let user = new User();
	user._id = req.session.user;
	deposit.creationUser = user;
	deposit.operationType = 'C';


	if (deposit.name && deposit.branch) {


		let json = '{"$and":[{"operationType": {"$ne": "D"}},';
		if (deposit.branch && deposit.branch._id) {
			json = json + '{"branch": "' + deposit.branch._id + '"},';
		} else {
			json = json + '{"branch": "' + deposit.branch + '"},';
		}
		json = json + '{"name": "' + deposit.name + '"}]}';


		let where;
		try {
			where = JSON.parse(json);
		} catch (err) {
			fileController.writeLog(req, res, next, 500, json);
			fileController.writeLog(req, res, next, 500, err);
			return res.status(500).send(constants.ERR_SERVER);
		}

		Deposit.find(where).exec((err, deposits) => {
			if (err) {
				fileController.writeLog(req, res, next, 500, err);
				return res.status(500).send(constants.ERR_SERVER);
			} else {
				if (!deposits || deposits.length === 0) {
					deposit.save((err, depositSave) => {
						if (err) {
							fileController.writeLog(req, res, next, 500, err);
							return res.status(500).send(constants.ERR_SERVER);
						} else {
							getDeposit(req, res, next, depositSave._id);
						}
					});
				} else {
					let message = 'El depósito \"' + deposit.name + '\" ya existe ';
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

function updateDeposit(req, res, next) {

	initConnectionDB(req.session.database);

	let depositId = req.query.id;
	let deposit = req.body;

	let user = new User();
	user._id = req.session.user;
	deposit.updateUser = user;
	deposit.operationType = 'U';

	if (deposit.name && deposit.branch) {

		let json = '{"$and":[{"operationType": {"$ne": "D"}},';
		if (deposit.branch && deposit.branch._id) {
			json = json + '{"branch": "' + deposit.branch._id + '"},';
		} else {
			json = json + '{"branch": "' + deposit.branch + '"},';
		}
		json = json + '{"_id": {"$ne": "' + depositId + '"}},';
		json = json + '{"name": "' + deposit.name + '"}]}';

		let where;
		try {
			where = JSON.parse(json);
		} catch (err) {
			fileController.writeLog(req, res, next, 500, json);
			fileController.writeLog(req, res, next, 500, err);
			return res.status(500).send(constants.ERR_SERVER);
		}

		Deposit.find(where).exec((err, deposits) => {
			if (err) {
				fileController.writeLog(req, res, next, 500, err);
				return res.status(500).send(constants.ERR_SERVER);
			} else {
				if (!deposits || deposits.length === 0) {
					Deposit.findByIdAndUpdate(depositId, deposit, (err, depositUpdated) => {
						if (err) {
							fileController.writeLog(req, res, next, 500, err);
							return res.status(500).send(constants.ERR_SERVER);
						} else {
							getDeposit(req, res, next, depositUpdated._id);
						}
					});
				} else {
					let message = 'El depósito \"' + deposit.name + '\" ya existe';
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

function deleteDeposit(req, res, next) {

	initConnectionDB(req.session.database);

	let depositId = req.query.id;

	let user = new User();
	user._id = req.session.user;

	Deposit.findByIdAndUpdate(depositId,
		{
			$set: {
				updateUser: user,
				updateDate: moment().format('YYYY-MM-DDTHH:mm:ssZ'),
				operationType: 'D'
			}
		}, (err, depositUpdated) => {
			if (err) {
				fileController.writeLog(req, res, next, 500, err);
				return res.status(500).send(constants.ERR_SERVER);
			} else {
				fileController.writeLog(req, res, next, 200, "Deposito " + depositUpdated);
				return res.status(200).send({ deposit: depositUpdated });
			}
		});
}

function initConnectionDB(database) {

	const Model = require('./../models/model');

	let DespositSchema = require('./../models/deposit');
	Deposit = new Model('deposit', {
		schema: DespositSchema,
		connection: database
	});

	let BranchSchema = require('./../models/branch');
	Branch = new Model('branch', {
		schema: BranchSchema,
		connection: database
	});

	let UserSchema = require('./../models/user');
	User = new Model('user', {
		schema: UserSchema,
		connection: database
	});
}

module.exports = {
	get,
	getDeposit,
	getDeposits,
	getDepositsV2,
	saveDeposit,
	updateDeposit,
	deleteDeposit
}