'use strict'

let fileController = require('./file.controller');
let constants = require('./../utilities/constants');
const { EJSON } = require('bson');
let moment = require('moment');
moment.locale('es');

let Employee;
let EmployeeType;
let User;
let Transaction;

function getEmployee(req, res, next, id = undefined) {

	initConnectionDB(req.session.database);

	let employeeId;
	if (id) {
		employeeId = id;
	} else {
		employeeId = req.query.id;
	}

	Employee.findById(employeeId, (err, employee) => {
		if (err) {
			fileController.writeLog(req, res, next, 500, err);
			return res.status(500).send(constants.ERR_SERVER);
		} else {
			if (!employee || employee.operationType == 'D') {
				fileController.writeLog(req, res, next, 404, constants.NO_DATA_FOUND);
				return res.status(404).send(constants.NO_DATA_FOUN);
			} else {
				EmployeeType.populate(employee, { path: 'type' }, (err, employee) => {
					if (err) {
						fileController.writeLog(req, res, next, 500, err);
						return res.status(500).send(constants.ERR_SERVER);
					} else {
						fileController.writeLog(req, res, next, 200, employee);
						return res.status(200).send({ employee: employee });
					}
				});
			}
		}
	});
}

function getEmployees(req, res, next) {

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

	Employee.find(where).
		limit(limit).
		select(select).
		sort(sort).
		skip(skip).
		exec((err, employees) => {
			if (err) {
				fileController.writeLog(req, res, next, 500, err);
				return res.status(500).send(constants.ERR_SERVER);
			} else {
				if (!employees) {
					fileController.writeLog(req, res, next, 404, constants.NO_DATA_FOUND);
					return res.status(404).send(constants.NO_DATA_FOUN);
				} else if (employees.length === 0) {
					let message = { message: constants.NO_DATA_FOUND };
					fileController.writeLog(req, res, next, 200, message);
					return res.status(200).send(message);
				} else {
					EmployeeType.populate(employees, { path: 'type' }, (err, employees) => {
						if (err) {
							fileController.writeLog(req, res, next, 500, err);
							return res.status(500).send(constants.ERR_SERVER);
						} else {
							fileController.writeLog(req, res, next, 200, employees.length);
							return res.status(200).send({ employees: employees });
						}
					});
				}
			}
		});
}

function getEmployeesV2(req, res, next) {

	initConnectionDB(req.session.database);

	let queryAggregate = [];
	let group;

	if (req.query && req.query !== {}) {

		let error;

		let project = req.query.project;
		if (project && project !== {} && project !== "{}") {
			try {
				project = JSON.parse(project);

				if (searchPropertyOfArray(project, 'type.')) {
					queryAggregate.push({ $lookup: { from: "employee-types", foreignField: "_id", localField: "type", as: "type" } });
					queryAggregate.push({ $unwind: { path: "$type", preserveNullAndEmptyArrays: true } });
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
						if (searchPropertyOfArray(JSON.parse(group), 'employees')) {
							projectGroup = `{ "employees": { "$slice": ["$employees", ${skip}, ${limit}] }`;
						} else {
							projectGroup = `{ "items": { "$slice": ["$items", ${skip}, ${limit}] }`;
						}
						for (let prop of Object.keys(JSON.parse(group))) {
							if (prop !== 'employees' && prop !== 'items') {
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

	Employee.aggregate(queryAggregate)
		.then(function (result) {
			fileController.writeLog(req, res, next, 200, result.length);
			if (result.length > 0) {
				if (group && group !== "{}" && group !== {}) {
					return res.status(200).send(result);
				} else {
					return res.status(200).send({ employees: result });
				}
			} else {
				if (group && group !== "{}" && group !== {}) {
					return res.status(200).send({ count: 0, employees: [] });
				} else {
					return res.status(200).send({ employees: [] });
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

function saveEmployee(req, res, next) {

	initConnectionDB(req.session.database);

	let employee = new Employee();
	let params = req.body;

	employee.code = params.code;
	employee.name = params.name;
	employee.type = params.type;

	let user = new User();
	user._id = req.session.user;
	employee.creationUser = user;
	employee.creationDate = moment().format('YYYY-MM-DDTHH:mm:ssZ');
	employee.operationType = 'C';

	if (employee.code &&
		employee.name &&
		employee.type) {

		let json = '{"$and":[{"operationType": {"$ne": "D"}},';
		json = json + '{"code": ' + employee.code + '}]}';
		let where;
		try {
			where = JSON.parse(json);
		} catch (err) {
			fileController.writeLog(req, res, next, 500, json);
			fileController.writeLog(req, res, next, 500, err);
			return res.status(500).send(constants.ERR_SERVER);
		}

		Employee.find(where).exec((err, employees) => {
			if (err) {
				fileController.writeLog(req, res, next, 500, err);
				return res.status(500).send(constants.ERR_SERVER);
			} else {
				if (!employees || employees.length === 0) {
					employee.save((err, employeeSaved) => {
						if (err) {
							fileController.writeLog(req, res, next, 500, err);
							return res.status(500).send(constants.ERR_SERVER);
						} else {
							getEmployee(req, res, next, employeeSaved._id);
						}
					});
				} else {
					let message = 'El empleado \"' + employee.code + '\" ya existe';
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

function updateEmployee(req, res, next) {

	initConnectionDB(req.session.database);

	let employeeId = req.query.id;
	let employee = req.body;

	let user = new User();
	user._id = req.session.user;
	employee.updateUser = user;
	employee.updateDate = moment().format('YYYY-MM-DDTHH:mm:ssZ');
	employee.operationType = 'U';

	if (employee.code &&
		employee.name &&
		employee.type) {

		let json = '{"$and":[{"operationType": {"$ne": "D"}},';
		json = json + '{"code": "' + employee.code + '"},';
		json = json + '{"_id": {"$ne": "' + employeeId + '"}}]}';
		let where;
		try {
			where = JSON.parse(json);
		} catch (err) {
			fileController.writeLog(req, res, next, 500, json);
			fileController.writeLog(req, res, next, 500, err);
			return res.status(500).send(constants.ERR_SERVER);
		}

		Employee.find(where).exec((err, employees) => {
			if (err) {
				fileController.writeLog(req, res, next, 500, err);
				return res.status(500).send(constants.ERR_SERVER);
			} else {
				if (!employees || employees.length === 0) {
					Employee.findByIdAndUpdate(employeeId, employee, (err, employeeUpdated) => {
						if (err) {
							fileController.writeLog(req, res, next, 500, err);
							return res.status(500).send(constants.ERR_SERVER);
						} else {
							getEmployee(req, res, next, employeeUpdated._id);
						}
					});
				} else {
					let message = 'El empleado \"' + employee.code + '\" ya existe';
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

function deleteEmployee(req, res, next) {

	initConnectionDB(req.session.database);

	let employeeId = req.query.id;

	let user = new User();
	user._id = req.session.user;

	Employee.findByIdAndUpdate(employeeId,
		{
			$set: {
				updateUser: user,
				updateDate: moment().format('YYYY-MM-DDTHH:mm:ssZ'),
				operationType: 'D'
			}
		}, (err, employeeUpdated) => {
			if (err) {
				fileController.writeLog(req, res, next, 500, err);
				return res.status(500).send(constants.ERR_SERVER);
			} else {
				fileController.writeLog(req, res, next, 200, employeeUpdated._id);
				return res.status(200).send({ employee: employeeUpdated })
			}
		});
}

function getSalesByEmployee(req, res, next) {

	const mongoose = require('mongoose');

	initConnectionDB(req.session.database);

	let query;
	try {
		query = JSON.parse(req.query.query);
	} catch (err) {
		fileController.writeLog(req, res, next, 500, err);
		return res.status(500).send(constants.ERR_SERVER);
	}

	let type = query.type;
	let currentAccount = query.currentAccount;
	let modifyStock = query.modifyStock;
	let startDate = query.startDate;
	let endDate = query.endDate;
	let sort = query.sort;
	let limit = query.limit;
	let branch = query.branch;

	let queryAggregate = [];
	queryAggregate.push({
		$lookup:
		{
			from: "employees",
			localField: "employeeOpening",
			foreignField: "_id",
			as: "employee"
		}
	});
	queryAggregate.push({
		$unwind: "$employee"
	});
	queryAggregate.push({
		$match: {
			$and: [
				{
					"endDate": {
						$gte: new Date(startDate)
					}
				},
				{
					"endDate": {
						$lte: new Date(endDate)
					}
				},
				{
					"state": "Cerrado",
				},
				{
					"operationType": { "$ne": "D" }
				}
			]
		}
	});
	if (branch && branch !== "") {
		queryAggregate.push({
			$match:
			{
				"branchDestination": mongoose.Types.ObjectId(branch)
			}
		});
	}
	queryAggregate.push({
		$lookup:
		{
			from: "transaction-types",
			localField: "type",
			foreignField: "_id",
			as: "type"
		}
	});
	queryAggregate.push({
		$unwind: "$type"
	});
	queryAggregate.push({
		$match:
		{
			$and:
				[
					{
						"type.transactionMovement": type,
						"type.currentAccount": currentAccount,
						"type.modifyStock": modifyStock
					}
				],
		}
	});
	queryAggregate.push({
		$project: {
			employee: "$employee",
			count: {
				$cond:
					[
						{
							$and:
								[
									{ $eq: ["$type.movement", "Entrada"] }
								]
						}, 1, -1
					],
			},
			totalPrice: {
				$cond:
					[
						{
							$and:
								[
									{ $eq: ["$type.movement", "Entrada"] }
								]
						}, "$totalPrice", { $multiply: ["$totalPrice", -1] }
					],
			},
		}
	});
	queryAggregate.push({
		$group: {
			_id: "$employee",
			count: { $sum: "$count" },
			total: { $sum: "$totalPrice" }
		}
	});
	queryAggregate.push({
		$project: {
			employee: "$_id",
			count: 1,
			total: 1
		}
	});
	queryAggregate.push({ $sort: sort });

	if (limit && limit != 0) {
		queryAggregate.push({ $limit: limit });
	}

	Transaction.aggregate(queryAggregate).
		then(function (result) {
			fileController.writeLog(req, res, next, 200, result.length);
			return res.status(200).send(result);
		}).catch(err => {
			fileController.writeLog(req, res, next, 500, err);
			return res.status(500).send(err);
		});
}

function initConnectionDB(database) {

	let EmployeeSchema = require('./../models/employee');
	const Model = require('./../models/model');
	Employee = new Model('employee', {
		schema: EmployeeSchema,
		connection: database
	});

	let EmployeeTypeSchema = require('./../models/employee-type');
	EmployeeType = new Model('employee-type', {
		schema: EmployeeTypeSchema,
		connection: database
	});

	let UserSchema = require('./../models/user');
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
	getEmployee,
	getEmployees,
	getEmployeesV2,
	saveEmployee,
	updateEmployee,
	deleteEmployee,
	getSalesByEmployee
}