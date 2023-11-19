'use strict'

let fileController = require('./file.controller');
let constants = require('../utilities/constants');
const { EJSON } = require('bson');
let moment = require('moment');
moment.locale('es');

let Structure;
let User;
let Article;

function getStructure(req, res, next, id = undefined) {

	initConnectionDB(req.session.database);

	let structureId;
	if (id) {
		structureId = id;
	} else {
		structureId = req.query.id;
	}

	Structure.findById(structureId, (err, structure) => {
		if (err) {
			fileController.writeLog(req, res, next, 500, err);
			return res.status(500).send(err);
		} else {
			if (!structure || structure.operationType == 'D') {
				fileController.writeLog(req, res, next, 404, constants.NO_DATA_FOUND);
				return res.status(404).send(constants.NO_DATA_FOUND);
			} else {
				Article.populate(structure, { path: 'parent' }, (err, structure) => {
					if (err) {
						fileController.writeLog(req, res, next, 500, err);
						return res.status(500).send(constants.ERR_SERVER);
					} else if (!structure) {
						fileController.writeLog(req, res, next, 404, constants.NO_DATA_FOUND);
						return res.status(404).send(constants.NO_DATA_FOUND);
					} else {
						Article.populate(structure, { path: 'child' }, (err, structure) => {
							if (err) {
								fileController.writeLog(req, res, next, 500, err);
								return res.status(500).send(constants.ERR_SERVER);
							} else if (!structure) {
								fileController.writeLog(req, res, next, 404, constants.NO_DATA_FOUND);
								return res.status(404).send(constants.NO_DATA_FOUND);
							} else {
								fileController.writeLog(req, res, next, 200, structure);
								return res.status(200).send({ structure: structure });
							}
						});
					}
				});
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

function getStructures(req, res, next) {

	initConnectionDB(req.session.database);

	let queryAggregate = [];
	let group;

	if (req.query && req.query !== {}) {

		let error;

		let project = req.query.project;
		if (project && project !== {} && project !== "{}") {
			try {
				project = JSON.parse(project);

				if (searchPropertyOfArray(project, 'parent.')) {
					queryAggregate.push({ $lookup: { from: "articles", foreignField: "_id", localField: "parent", as: "parent" } });
					queryAggregate.push({ $unwind: { path: "$parent", preserveNullAndEmptyArrays: true } });
				}

				if (searchPropertyOfArray(project, 'child.')) {
					queryAggregate.push({ $lookup: { from: "articles", foreignField: "_id", localField: "child", as: "child" } });
					queryAggregate.push({ $unwind: { path: "$child", preserveNullAndEmptyArrays: true } });

					if (searchPropertyOfArray(project, 'child.category.')) {
						queryAggregate.push({ $lookup: { from: "categories", foreignField: "_id", localField: "child.category", as: "child.category" } });
						queryAggregate.push({ $unwind: { path: "$child.category", preserveNullAndEmptyArrays: true } });
					}
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
						if (searchPropertyOfArray(JSON.parse(group), 'structures')) {
							projectGroup = `{ "structures": { "$slice": ["$structures", ${skip}, ${limit}] }`;
						} else {
							projectGroup = `{ "items": { "$slice": ["$items", ${skip}, ${limit}] }`;
						}
						for (let prop of Object.keys(JSON.parse(group))) {
							if (prop !== 'structures' && prop !== 'items') {
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

	Structure.aggregate(queryAggregate)
		.then(function (result) {
			fileController.writeLog(req, res, next, 200, result.length);
			if (result.length > 0) {
				if (group && group !== "{}" && group !== {}) {
					return res.status(200).send(result);
				} else {
					return res.status(200).send({ structures: result });
				}
			} else {
				if (group && group !== "{}" && group !== {}) {
					return res.status(200).send({ count: 0, structures: [] });
				} else {
					return res.status(200).send({ structures: [] });
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

function saveStructure(req, res, next) {

	initConnectionDB(req.session.database);

	let structure = new Structure();
	let params = req.body;

	structure.parent = params.parent;
	structure.child = params.child;
	structure.quantity = params.quantity;
	structure.utilization = params.utilization;
	structure.optional = params.optional;
	structure.increasePrice = params.increasePrice;

	let user = new User();
	user._id = req.session.user;
	structure.creationUser = user;
	structure.creationDate = moment().format('YYYY-MM-DDTHH:mm:ssZ');
	structure.operationType = 'C';


	if (structure.parent &&
		structure.child) {

		let json = '{"$and":[{"operationType": {"$ne": "D"}},';
		if (structure.parent._id) {
			json = json + '{"$and":[{"parent": "' + structure.parent._id + '"},';
		} else {
			json = json + '{"$and":[{"parent": "' + structure.parent + '"},';
		}
		if (structure.child._id) {
			json = json + '{"child": "' + structure.child._id + '"}]}]}';
		} else {
			json = json + '{"child": "' + structure.child + '"}]}]}';
		}

		let where;
		try {
			where = JSON.parse(json);
		} catch (err) {
			fileController.writeLog(req, res, next, 500, json);
			fileController.writeLog(req, res, next, 500, err);
			return res.status(500).send(constants.ERR_SERVER);
		}

		Structure.find(where).exec((err, structures) => {
			if (err) {
				fileController.writeLog(req, res, next, 500, err);
				return res.status(500).send(constants.ERR_SERVER);
			} else {
				if (!structures || structures.length === 0) {
					structure.save((err, structureSave) => {
						if (err) {
							fileController.writeLog(req, res, next, 500, err);
							return res.status(500).send(err);
						} else {
							fileController.writeLog(req, res, next, 200, structureSave._id);
							getStructure(req, res, next, structureSave._id);
						}
					})
				} else {
					let message = 'La estructura ya existe';
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

function updateStructure(req, res, next) {

	initConnectionDB(req.session.database);

	let structureId = req.query.id;
	let structure = req.body;

	let user = new User();
	user._id = req.session.user;
	structure.updateUser = user;
	structure.updateDate = moment().format('YYYY-MM-DDTHH:mm:ssZ');
	structure.operationType = 'U';


	if (structure.parent &&
		structure.child) {

		let json = '{"$and":[{"operationType": {"$ne": "D"}},';
		json = json + '{"$and":[{"parent": "' + structure.parent._id + '"},';
		json = json + '{"child": "' + structure.child._id + '"}]},';
		json = json + '{"_id": {"$ne": "' + structureId + '"}}]}';

		let where;
		try {
			where = JSON.parse(json);
		} catch (err) {
			fileController.writeLog(req, res, next, 500, json);
			fileController.writeLog(req, res, next, 500, err);
			return res.status(500).send(constants.ERR_SERVER);
		}

		Structure.find(where).exec((err, structures) => {
			if (err) {
				fileController.writeLog(req, res, next, 500, err);
				return res.status(500).send(constants.ERR_SERVER);
			} else {
				if (!structures || structures.length === 0) {
					Structure.findByIdAndUpdate(structureId, structure, (err, structureUpdated) => {
						if (err) {
							fileController.writeLog(req, res, next, 500, err);
							return res.status(500).send(err);
						} else {
							fileController.writeLog(req, res, next, 200, structureUpdated._id);
							getStructure(req, res, next, structureUpdated._id);
						}
					})
				} else {
					let message = 'La estructura ya existe';
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

function deleteStructure(req, res, next) {

	initConnectionDB(req.session.database);

	let structureId = req.query.id;

	let user = new User();
	user._id = req.session.user;

	Structure.findByIdAndUpdate(structureId,
		{
			$set: {
				updateUser: user,
				updateDate: moment().format('YYYY-MM-DDTHH:mm:ssZ'),
				operationType: 'D'
			}
		}, (err, structureUpdated) => {
			if (err) {
				fileController.writeLog(req, res, next, 500, err);
				return res.status(500).send(err);
			} else {
				fileController.writeLog(req, res, next, 200, structureUpdated);
				return res.status(200).send({ structure: structureUpdated });
			}
		})
}

function initConnectionDB(database) {

	const Model = require('../models/model');

	let StructureSchema = require('./../models/structure');
	Structure = new Model('structure', {
		schema: StructureSchema,
		connection: database
	});

	let UserSchema = require('../models/user');
	User = new Model('user', {
		schema: UserSchema,
		connection: database
	});

	let ArticleSchema = require('./../models/article');
	Article = new Model('article', {
		schema: ArticleSchema,
		connection: database
	});
}

module.exports = {
	getStructure,
	getStructures,
	saveStructure,
	updateStructure,
	deleteStructure
}