
'use strict'

let fileController = require('./file.controller');
let constants = require('./../utilities/constants');
const { EJSON } = require('bson');
let moment = require('moment');
moment.locale('es');

let Printer;
let User;

function getPrinter(req, res, next, id = undefined) {

	initConnectionDB(req.session.database);

	let printerId;
	if (id) {
		printerId = id;
	} else {
		printerId = req.query.id;
	}

	Printer.findById(printerId, (err, printer) => {
		if (err) {
			fileController.writeLog(req, res, next, 500, err);
			return res.status(500).send(constants.ERR_SERVER);
		} else {
			if (!printer || printer.operationType == 'D') {
				fileController.writeLog(req, res, next, 404, constants.NO_DATA_FOUND);
				return res.status(404).send(constants.NO_DATA_FOUND);
			} else {
				fileController.writeLog(req, res, next, 200, printer._id);
				return res.status(200).send({ printer: printer });
			}
		}
	});
}

function getPrinters(req, res, next) {

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

	Printer.find(where).
		limit(limit).
		select(select).
		sort(sort).
		skip(skip).
		exec((err, printers) => {
			if (err) {
				fileController.writeLog(req, res, next, 500, err);
				return res.status(500).send(constants.ERR_SERVER);
			} else {
				if (!printers) {
					fileController.writeLog(req, res, next, 404, constants.NO_DATA_FOUND);
					return res.status(404).send(constants.NO_DATA_FOUND);
				} else if (printers.length === 0) {
					fileController.writeLog(req, res, next, 200, constants.NO_DATA_FOUND);
					return res.status(200).send({ message: constants.NO_DATA_FOUND });
				} else {
					fileController.writeLog(req, res, next, 200, printers.length);
					return res.status(200).send({ printers: printers });
				}
			}
		});
}

function getPrintersV2(req, res, next) {

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
						if (searchPropertyOfArray(JSON.parse(group), 'printers')) {
							projectGroup = `{ "printers": { "$slice": ["$printers", ${skip}, ${limit}] }`;
						} else {
							projectGroup = `{ "items": { "$slice": ["$items", ${skip}, ${limit}] }`;
						}
						for (let prop of Object.keys(JSON.parse(group))) {
							if (prop !== 'printers' && prop !== 'items') {
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

	Printer.aggregate(queryAggregate)
		.then(function (result) {
			fileController.writeLog(req, res, next, 200, result.length);
			if (result.length > 0) {
				if (group && group !== "{}" && group !== {}) {
					return res.status(200).send(result);
				} else {
					return res.status(200).send({ printers: result });
				}
			} else {
				if (group && group !== "{}" && group !== {}) {
					return res.status(200).send({ count: 0, printers: [] });
				} else {
					return res.status(200).send({ printers: [] });
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

function savePrinter(req, res, next) {

	initConnectionDB(req.session.database);

	let printer = new Printer();
	let params = req.body;

	printer.name = params.name;
	printer.origin = params.origin;
	printer.connectionURL = params.connectionURL;
	printer.type = params.type;
	printer.pageWidth = params.pageWidth;
	printer.pageHigh = params.pageHigh;
    printer.labelWidth = params.labelWidth;
	printer.labelHigh = params.labelHigh;
	printer.printIn = params.printIn;
	printer.url = params.url;

	printer.orientation = params.orientation;
	printer.row = params.row;
	printer.addPag = params.addPag;
    printer.quantity = params.quantity;
	printer.fields = params.fields;

	let user = new User();
	user._id = req.session.user;
	printer.creationUser = user;
	printer.creationDate = moment().format('YYYY-MM-DDTHH:mm:ssZ');
	printer.operationType = 'C';

	if (printer.name &&
		printer.type &&
		printer.printIn) {

		let json = '{"$and":[{"operationType": {"$ne": "D"}},';
		json = json + '{"name": "' + printer.name + '"},';
		json = json + '{"type": "' + printer.type + '"}]}';
		let where;
		try {
			where = JSON.parse(json);
		} catch (err) {
			fileController.writeLog(req, res, next, 500, json);
			fileController.writeLog(req, res, next, 500, err);
			return res.status(500).send(constants.ERR_SERVER);
		}

		Printer.find(where).exec((err, printers) => {
			if (err) {
				fileController.writeLog(req, res, next, 500, err);
				return res.status(500).send(constants.ERR_SERVER);
			} else {
				if (!printers || printers.length === 0) {
					printer.save((err, printerSaved) => {
						if (err) {
							fileController.writeLog(req, res, next, 500, err);
							return res.status(500).send(constants.ERR_SERVER);
						} else {
							getPrinter(req, res, next, printerSaved._id);
						}
					});
				} else {
					let message = 'La impresora \"' + printer.name + '\" y tipo \"' + printer.type + '\" ya existe';
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

function updatePrinter(req, res, next) {

	initConnectionDB(req.session.database);

	let printerId = req.query.id;
	let printer = req.body;

	let user = new User();
	user._id = req.session.user;
	printer.updateUser = user;
	printer.updateDate = moment().format('YYYY-MM-DDTHH:mm:ssZ');
	printer.operationType = 'U';

	if (printer.name &&
		printer.type &&
		printer.printIn) {

		let json = '{"$and":[{"operationType": {"$ne": "D"}},';
		json = json + '{"name": "' + printer.name + '"},';
		json = json + '{"type": "' + printer.type + '"},';
		json = json + '{"_id": {"$ne": "' + printerId + '"}}]}';
		let where;
		try {
			where = JSON.parse(json);
		} catch (err) {
			fileController.writeLog(req, res, next, 500, json);
			fileController.writeLog(req, res, next, 500, err);
			return res.status(500).send(constants.ERR_SERVER);
		}

		Printer.find(where).exec((err, printers) => {
			if (err) {
				fileController.writeLog(req, res, next, 500, err);
				return res.status(500).send(constants.ERR_SERVER);
			} else {
				if (!printers || printers.length === 0) {
					Printer.findByIdAndUpdate(printerId, printer, (err, printerUpdated) => {
						if (err) {
							fileController.writeLog(req, res, next, 500, err);
							return res.status(500).send(constants.ERR_SERVER);
						} else {
							getPrinter(req, res, next, printerUpdated._id);
						}
					});
				} else {
					let message = 'La impresora \"' + printer.name + '\" y tipo \"' + printer.type + '\" ya existe';
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

function deletePrinter(req, res, next) {

	initConnectionDB(req.session.database);

	let printerId = req.query.id;

	let user = new User();
	user._id = req.session.user;

	Printer.findByIdAndUpdate(printerId,
		{
			$set: {
				updateUser: user,
				updateDate: moment().format('YYYY-MM-DDTHH:mm:ssZ'),
				operationType: 'D'
			}
		}, (err, printerDelete) => {
			if (err) {
				fileController.writeLog(req, res, next, 500, err);
				return res.status(500).send(constants.ERR_SERVER);
			} else {
				fileController.writeLog(req, res, next, 200, printerDelete._id);
				return res.status(200).send({ printer: printerDelete });
			}
		});
}

function initConnectionDB(database) {
	let PrinterSchema = require('./../models/printer');
	const Model = require('./../models/model');
	Printer = new Model('printer', {
		schema: PrinterSchema,
		connection: database
	});

	let UserSchema = require('./../models/user');
	User = new Model('user', {
		schema: UserSchema,
		connection: database
	});
}

module.exports = {
	getPrinter,
	getPrinters,
	getPrintersV2,
	savePrinter,
	updatePrinter,
	deletePrinter
}