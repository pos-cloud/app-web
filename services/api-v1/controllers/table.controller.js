'use strict'

let fileController = require('./file.controller');
let constants = require('./../utilities/constants');
const { EJSON } = require('bson');
let moment = require('moment');
moment.locale('es');
let mongoose = require('mongoose');

let Table;
let Room;
let Employee;
let User;
let Transaction;

// METODOS ASYNC
async function get(id) {
	return new Promise(async (resolve, reject) => {
		if (mongoose.Types.ObjectId.isValid(id)) {
			await Table.findById(id, (err, table) => {
				(err) ? reject(err) : resolve(table);
			})
				.populate({ path: 'room', model: Room })
				.populate({ path: 'employee', model: Employee })
				.populate({ path: 'lastTransaction', model: Transaction });
		} else {
			reject(null);
		}
	});
}

// METODOS ASYNC
async function update(req, res, next, tableId, table) {

	return new Promise(async (resolve, reject) => {

		initConnectionDB(req.session.database);

		let user = new User();
		user._id = req.session.user;
		table.updateUser = user;
		table.updateDate = moment().format('YYYY-MM-DDTHH:mm:ssZ');
		table.operationType = 'U';

		if (table.description &&
			table.room &&
			table.chair &&
			table.state) {
			let json = '{"$and":[{"operationType": {"$ne": "D"}},';
			json = json + '{"description": "' + table.description + '"},';
			if (table.room._id) {
				json = json + '{"room": "' + table.room._id + '"},';
			} else {
				json = json + '{"room": "' + table.room + '"},';
			}
			json = json + '{"_id": {"$ne": "' + tableId + '"}}]}';
			let where;
			try {
				where = JSON.parse(json);
			} catch (err) {
				reject(err);
			}

			await Table.find(where).exec(async (err, tables) => {
				if (err) {
					reject(err);
				} else {
					if (!tables || tables.length === 0) {
						Table.updateOne({ _id: tableId }, table, async (err, result) => {
							if (err) {
								reject(err);
							} else {
								if (result && result.ok == 1 && result.n == 1) {
									await get(tableId).then(
										table => {
											if (!table || table.operationType == 'D') {
												reject(constants.NO_DATA_FOUND);
											} else {
												resolve(table);
											}
										}
									).catch(
										err => {
											reject(err);
										}
									);
								} else {
									reject(result);
								}
							}
						});
					} else {
						let message = 'La mesa \"' + table.description + '\" en el salón seleccionado ya existe';
						reject(message);
					}
				}
			});
		} else {
			reject({ message: constants.COMPLETE_ALL_THE_DATA });
		}
	});
}

async function getTable(req, res, next, id = undefined) {

	initConnectionDB(req.session.database);

	let tableId;
	if (id) {
		tableId = id;
	} else {
		tableId = req.query.id;
	}

	await get(tableId).then(
		table => {
			if (!table || table.operationType == 'D') {
				fileController.writeLog(req, res, next, 404, constants.NO_DATA_FOUND);
				return res.status(404).send(constants.NO_DATA_FOUN);
			} else {
				fileController.writeLog(req, res, next, 200, table._id);
				return res.status(200).send({ table: table });
			}
		}
	).catch(
		err => {
			fileController.writeLog(req, res, next, 500, err);
			return res.status(500).send(constants.ERR_SERVER);
		}
	);
}

function getTables(req, res, next) {

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

	Table.find(where).
		limit(limit).
		select(select).
		sort(sort).
		skip(skip).
		exec((err, tables) => {
			if (err) {
				fileController.writeLog(req, res, next, 500, err);
				return res.status(500).send(constants.ERR_SERVER);
			} else {
				if (!tables) {
					fileController.writeLog(req, res, next, 404, constants.NO_DATA_FOUND);
					return res.status(404).send(constants.NO_DATA_FOUND);
				} else if (tables.length === 0) {
					fileController.writeLog(req, res, next, 200, constants.NO_DATA_FOUND);
					return res.status(200).send({ message: constants.NO_DATA_FOUND });
				} else {
					Room.populate(tables, { path: 'room' }, (err, tables) => {
						if (err) {
							fileController.writeLog(req, res, next, 500, err);
							return res.status(500).send(constants.ERR_SERVER);
						} else {
							Employee.populate(tables, { path: 'employee' }, (err, tables) => {
								if (err) {
									fileController.writeLog(req, res, next, 500, err);
									return res.status(500).send(constants.ERR_SERVER);
								} else if (!tables) {
									fileController.writeLog(req, res, next, 404, constants.NO_DATA_FOUND);
									return res.status(404).send(constants.NO_DATA_FOUND);
								} else {
									Transaction.populate(tables, { path: 'lastTransaction' }, (err, tables) => {
										if (err) {
											fileController.writeLog(req, res, next, 500, err);
											return res.status(500).send(constants.ERR_SERVER);
										} else if (!tables) {
											fileController.writeLog(req, res, next, 404, constants.NO_DATA_FOUND);
											return res.status(404).send(constants.NO_DATA_FOUND);
										} else {
											fileController.writeLog(req, res, next, 200, tables.length);
											return res.status(200).send({ tables: tables });
										}
									});
								}
							});
						}
					});
				}
			}
		});
}

function getTablesV2(req, res, next) {

	initConnectionDB(req.session.database);

	let queryAggregate = [];
	let group;

	if (req.query && req.query !== {}) {

		let error;

		let project = req.query.project;
		if (project && project !== {} && project !== "{}") {
			try {
				project = JSON.parse(project);

				if (searchPropertyOfArray(project, 'room.')) {
					queryAggregate.push({ $lookup: { from: "rooms", foreignField: "_id", localField: "room", as: "room" } });
					queryAggregate.push({ $unwind: { path: "$room", preserveNullAndEmptyArrays: true } });
				}

				if (searchPropertyOfArray(project, 'employee.')) {
					queryAggregate.push({ $lookup: { from: "employees", foreignField: "_id", localField: "employee", as: "employee" } });
					queryAggregate.push({ $unwind: { path: "$employee", preserveNullAndEmptyArrays: true } });
				}

				if (searchPropertyOfArray(project, 'lastTransaction.')) {
					queryAggregate.push({ $lookup: { from: "transactions", foreignField: "_id", localField: "lastTransaction", as: "lastTransaction" } });
					queryAggregate.push({ $unwind: { path: "$lastTransaction", preserveNullAndEmptyArrays: true } });
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
						if (searchPropertyOfArray(JSON.parse(group), 'tables')) {
							projectGroup = `{ "tables": { "$slice": ["$tables", ${skip}, ${limit}] }`;
						} else {
							projectGroup = `{ "items": { "$slice": ["$items", ${skip}, ${limit}] }`;
						}
						for (let prop of Object.keys(JSON.parse(group))) {
							if (prop !== 'tables' && prop !== 'items') {
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

	Table.aggregate(queryAggregate)
		.then(function (result) {
			fileController.writeLog(req, res, next, 200, result.length);
			if (result.length > 0) {
				if (group && group !== "{}" && group !== {}) {
					return res.status(200).send(result);
				} else {
					return res.status(200).send({ tables: result });
				}
			} else {
				if (group && group !== "{}" && group !== {}) {
					return res.status(200).send({ count: 0, tables: [] });
				} else {
					return res.status(200).send({ tables: [] });
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

function saveTable(req, res, next) {

	initConnectionDB(req.session.database);

	let table = new Table();
	let params = req.body;

	table.description = params.description;
	table.room = params.room;
	table.chair = params.chair;
	table.diners = params.diners;
	table.state = params.state;
	table.employee = params.employee;
	table.lastTransaction = params.lastTransaction;

	let user = new User();
	user._id = req.session.user;
	table.creationUser = user;
	table.creationDate = moment().format('YYYY-MM-DDTHH:mm:ssZ');
	table.operationType = 'C';

	if (table.description &&
		table.room &&
		table.chair &&
		table.state) {

		let json = '{"$and":[{"operationType": {"$ne": "D"}},';
		json = json + '{"description": "' + table.description + '"},';
		json = json + '{"room": "' + table.room + '"}]}';
		let where;
		try {
			where = JSON.parse(json);
		} catch (err) {
			fileController.writeLog(req, res, next, 500, json);
			fileController.writeLog(req, res, next, 500, err);
			return res.status(500).send(constants.ERR_SERVER);
		}

		Table.find(where).exec((err, tables) => {
			if (err) {
				fileController.writeLog(req, res, next, 500, err);
				return res.status(500).send(constants.ERR_SERVER);
			} else {
				if (!tables || tables.length === 0) {
					table.save((err, tableSaved) => {
						if (err) {
							fileController.writeLog(req, res, next, 500, err);
							return res.status(500).send(constants.ERR_SERVER);
						} else {
							getTable(req, res, next, tableSaved._id);
						}
					});
				} else {
					let message = 'La mesa \"' + table.description + '\" en el salón seleccionado ya existe';
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

async function updateTable(req, res, next) {

	initConnectionDB(req.session.database);

	let tableId = req.query.id;
	let table = req.body;

	await update(req, res, next, tableId, table).then(
		table => {
			fileController.writeLog(req, res, next, 200, table._id);
			return res.status(200).send({ table: table });
		}
	).catch(
		err => {
			fileController.writeLog(req, res, next, 500, err);
			return res.status(500).send(err);
		}
	);
}

function deleteTable(req, res, next) {

	initConnectionDB(req.session.database);

	let tableId = req.query.id;

	let user = new User();
	user._id = req.session.user;

	Table.findByIdAndUpdate(tableId,
		{
			$set: {
				updateUser: user,
				updateDate: moment().format('YYYY-MM-DDTHH:mm:ssZ'),
				operationType: 'D'
			}
		}, (err, tableUpdated) => {
			if (err) {
				fileController.writeLog(req, res, next, 500, err);
				return res.status(500).send(constants.ERR_SERVER);
			} else {
				fileController.writeLog(req, res, next, 200, tableUpdated._id);
				return res.status(200).send({ table: tableUpdated });
			}
		});
}

function initConnectionDB(database) {

	const Model = require('./../models/model');

	let TableSchema = require('./../models/table');
	Table = new Model('table', {
		schema: TableSchema,
		connection: database
	});

	let RoomSchema = require('./../models/room');
	Room = new Model('room', {
		schema: RoomSchema,
		connection: database
	});

	let EmployeeSchema = require('./../models/employee');
	Employee = new Model('employee', {
		schema: EmployeeSchema,
		connection: database
	});

	let TransactionSchema = require('./../models/transaction');
	Transaction = new Model('transaction', {
		schema: TransactionSchema,
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
	getTable,
	getTables,
	getTablesV2,
	saveTable,
	update,
	updateTable,
	deleteTable
}