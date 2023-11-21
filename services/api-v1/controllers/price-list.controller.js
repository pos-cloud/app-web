'use strict'

let fileController = require('./file.controller');
let constants = require('./../utilities/constants');
const { EJSON } = require('bson');
let moment = require('moment');
moment.locale('es');

let User;
let PriceList;
let Category;
let Make;
let Article

function getPriceList(req, res, next, id = undefined) {

	initConnectionDB(req.session.database);

	let priceListId;
	if (id) {
		priceListId = id;
	} else {
		priceListId = req.query.id;
	}

	PriceList.findById(priceListId, (err, priceList) => {
		if (err) {
			fileController.writeLog(req, res, next, 500, err);
			return res.status(500).send(constants.ERR_SERVER);
		} else {
			if (!priceList || priceList.operationType == 'D') {
				fileController.writeLog(req, res, next, 404, constants.NO_DATA_FOUND);
				return res.status(404).send(constants.NO_DATA_FOUND);
			} else {
				fileController.writeLog(req, res, next, 200, priceList);
				return res.status(200).send({ priceList: priceList });
			}
		}
	}).populate({
		path: 'creationUser',
		model: User
	}).populate({
		path: 'rules.make',
		model: Make
	}).populate({
		path: 'rules.category',
		model: Category
	}).populate({
		path: 'exceptions.article',
		model: Article
	}).populate({
		path: 'updateUser',
		model: User
	});
}

function getPriceLists(req, res, next) {

	//http://localhost:3000/api/priceLists/limit=6&skip=0&select=name,code&sort="code":1&where="name":"s"


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

	PriceList.find(where).
		limit(limit).
		select(select).
		sort(sort).
		skip(skip).
		exec((err, priceLists) => {
			if (err) {
				fileController.writeLog(req, res, next, 500, err);
				return res.status(500).send(constants.ERR_SERVER);
			} else {
				if (!priceLists) {
					fileController.writeLog(req, res, next, 404, constants.NO_DATA_FOUND);
					return res.status(404).send(constants.NO_DATA_FOUND);
				} else if (priceLists.length === 0) {
					fileController.writeLog(req, res, next, 200, constants.NO_DATA_FOUND);
					return res.status(200).send({ message: constants.NO_DATA_FOUND });
				} else {
					fileController.writeLog(req, res, next, 200, 'PriceList ' + priceLists.length);
					return res.status(200).send({ priceLists: priceLists });
				}
			}
		});
}

function getPriceListsV2(req, res, next) {

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
						if (searchPropertyOfArray(JSON.parse(group), 'priceLists')) {
							projectGroup = `{ "priceLists": { "$slice": ["$priceLists", ${skip}, ${limit}] }`;
						} else {
							projectGroup = `{ "items": { "$slice": ["$items", ${skip}, ${limit}] }`;
						}
						for (let prop of Object.keys(JSON.parse(group))) {
							if (prop !== 'priceLists' && prop !== 'items') {
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

	PriceList.aggregate(queryAggregate)
		.then(function (result) {
			fileController.writeLog(req, res, next, 200, result.length);
			if (result.length > 0) {
				if (group && group !== "{}" && group !== {}) {
					return res.status(200).send(result);
				} else {
					return res.status(200).send({ priceLists: result });
				}
			} else {
				if (group && group !== "{}" && group !== {}) {
					return res.status(200).send({ count: 0, priceLists: [] });
				} else {
					return res.status(200).send({ priceLists: [] });
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

function savePriceList(req, res, next) {

	initConnectionDB(req.session.database);

	let priceList = new PriceList();
	let params = req.body;

	priceList.name = params.name;
	priceList.percentage = params.percentage;
	priceList.allowSpecialRules = params.allowSpecialRules;
	priceList.rules = params.rules;
	priceList.exceptions = params.exceptions;
	priceList.default = params.default;

	let user = new User();
	user._id = req.session.user;
	priceList.creationUser = user;
	priceList.creationDate = moment().format('YYYY-MM-DDTHH:mm:ssZ');
	priceList.operationType = 'C';



	if (priceList.name) {

		let json = '{"$and":[{"operationType": {"$ne": "D"}},';
		json = json + '{"name": "' + priceList.name + '"}]}';
		let where;
		try {
			where = JSON.parse(json);
		} catch (err) {
			fileController.writeLog(req, res, next, 500, json);
			fileController.writeLog(req, res, next, 500, err);
			return res.status(500).send(constants.ERR_SERVER);
		}

		PriceList.find(where).exec((err, priceLists) => {
			if (err) {
				fileController.writeLog(req, res, next, 500, err);
				return res.status(500).send(constants.ERR_SERVER);
			} else {
				if (!priceLists || priceLists.length === 0) {
					priceList.save((err, priceListSave) => {
						if (err) {
							fileController.writeLog(req, res, next, 500, err);
							return res.status(500).send(constants.ERR_SERVER);
						} else {
							getPriceList(req, res, next, priceListSave._id);
						}
					});
				} else {
					let message = 'La lista de precios \"' + priceList.name + '\" ya existe';
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

function updatePriceList(req, res, next) {

	initConnectionDB(req.session.database);

	let priceListId = req.query.id;
	let priceList = req.body;

	let user = new User();
	user._id = req.session.user;
	priceList.updateUser = user;
	priceList.updateDate = moment().format('YYYY-MM-DDTHH:mm:ssZ');
	priceList.operationType = 'U';

	if (priceList.name) {

		let json = '{"$and":[{"operationType": {"$ne": "D"}},';
		json = json + '{"name": "' + priceList.name + '"},';
		json = json + '{"_id": {"$ne": "' + priceListId + '"}}]}';
		let where;
		try {
			where = JSON.parse(json);
		} catch (err) {
			fileController.writeLog(req, res, next, 500, json);
			fileController.writeLog(req, res, next, 500, err);
			return res.status(500).send(constants.ERR_SERVER);
		}

		PriceList.find(where).exec((err, priceLists) => {
			if (err) {
				fileController.writeLog(req, res, next, 500, err);
				return res.status(500).send(constants.ERR_SERVER);
			} else {
				if (!priceLists || priceLists.length === 0) {
					PriceList.findByIdAndUpdate(priceListId, priceList, (err, priceListUpdated) => {
						if (err) {
							fileController.writeLog(req, res, next, 500, err);
							return res.status(500).send(constants.ERR_SERVER);
						} else {
							getPriceList(req, res, next, priceListUpdated._id);
						}
					});
				} else {
					let message = 'La Lista de precios \"' + priceList.code + '\" ya existe';
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

function deletePriceList(req, res, next) {

	initConnectionDB(req.session.database);

	let priceListId = req.query.id;

	let user = new User();
	user._id = req.session.user;

	PriceList.findByIdAndUpdate(priceListId,
		{
			$set: {
				updateUser: user,
				updateDate: moment().format('YYYY-MM-DDTHH:mm:ssZ'),
				operationType: 'D'
			}
		}, (err, priceListUpdated) => {
			if (err) {
				fileController.writeLog(req, res, next, 500, err);
				return res.status(500).send(constants.ERR_SERVER);
			} else {
				fileController.writeLog(req, res, next, 200, priceListUpdated);
				return res.status(200).send({ priceList: priceListUpdated });
			}
		});
}

function initConnectionDB(database) {

	const Model = require('./../models/model');

	let PriceListScheme = require('./../models/price-list');
	PriceList = new Model('price-list', {
		schema: PriceListScheme,
		connection: database
	});

	let UserSchema = require('./../models/user');
	User = new Model('user', {
		schema: UserSchema,
		connection: database
	});

	let CategorySchema = require('./../models/category');
	Category = new Model('category', {
		schema: CategorySchema,
		connection: database
	});

	let MakeSchema = require('./../models/make');
	Make = new Model('make', {
		schema: MakeSchema,
		connection: database
	});

	let ArticleSchema = require('./../models/article');
	Article = new Model('article', {
		schema: ArticleSchema,
		connection: database
	});
}

module.exports = {
	getPriceList,
	getPriceLists,
	getPriceListsV2,
	savePriceList,
	updatePriceList,
	deletePriceList
}