'use strict'

let fileController = require('./file.controller');
let constants = require('./../utilities/constants');
const { EJSON } = require('bson');
const axios = require('axios').default;
const config = require('./../config');

let moment = require('moment');
moment.locale('es');

let ArticleField;
let User;

function getArticleField(req, res, next, id = undefined) {

	initConnectionDB(req.session.database);

	let articleFieldId;
	if (id) {
		articleFieldId = id;
	} else {
		articleFieldId = req.query.id;
	}

	ArticleField.findById(articleFieldId, (err, articleField) => {
		if (err) {
			fileController.writeLog(req, res, next, 500, err);
			return res.status(500).send(constants.ERR_SERVER);
		} else {
			if (!articleField || articleField.operationType == 'D') {
				fileController.writeLog(req, res, next, 404, constants.NO_DATA_FOUND);
				return res.status(404).send(constants.NO_DATA_FOUND);
			} else {
				fileController.writeLog(req, res, next, 200, articleField);
				return res.status(200).send({ articleField: articleField });
			}
		}
	});
}

function getArticleFields(req, res, next) {

	//http://localhost:3000/api/articleFields/limit=6&skip=0&select=name,code&sort="code":1&where="name":"s"

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

	ArticleField.find(where).
		limit(limit).
		select(select).
		sort(sort).
		skip(skip).
		exec((err, articleFields) => {
			if (err) {
				fileController.writeLog(req, res, next, 500, err);
				return res.status(500).send(constants.ERR_SERVER);
			} else {
				if (!articleFields) {
					fileController.writeLog(req, res, next, 404, constants.NO_DATA_FOUND);
					return res.status(404).send(constants.NO_DATA_FOUND);
				} else {
					if (articleFields) {
						fileController.writeLog(req, res, next, 200, articleFields.length);
					}
					return res.status(200).send({ articleFields: articleFields });
				}
			}
		});
}

function getArticleFieldsV2(req, res, next) {

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
						if (searchPropertyOfArray(JSON.parse(group), 'articleFields')) {
							projectGroup = `{ "articleFields": { "$slice": ["$articleFields", ${skip}, ${limit}] }`;
						} else {
							projectGroup = `{ "items": { "$slice": ["$items", ${skip}, ${limit}] }`;
						}
						for (let prop of Object.keys(JSON.parse(group))) {
							if (prop !== 'articleFields' && prop !== 'items') {
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

	ArticleField.aggregate(queryAggregate)
		.then(function (result) {
			fileController.writeLog(req, res, next, 200, result.length);
			if (result.length > 0) {
				if (group && group !== "{}" && group !== {}) {
					return res.status(200).send(result);
				} else {
					return res.status(200).send({ articleFields: result });
				}
			} else {
				if (group && group !== "{}" && group !== {}) {
					return res.status(200).send({ count: 0, articleFields: [] });
				} else {
					return res.status(200).send({ articleFields: [] });
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

function saveArticleField(req, res, next) {

	initConnectionDB(req.session.database);

	let articleField = new ArticleField();
	let params = req.body;

	articleField.order = params.order;
	articleField.name = params.name;
	articleField.datatype = params.datatype;
	articleField.value = params.value;
	articleField.modify = params.modify;
	articleField.modifyVAT = params.modifyVAT;
	articleField.discriminateVAT = params.discriminateVAT;
	articleField.ecommerceEnabled = params.ecommerceEnabled;

	let user = new User();
	user._id = req.session.user;
	articleField.creationUser = user;
	articleField.creationDate = moment().format('YYYY-MM-DDTHH:mm:ssZ');
	articleField.operationType = 'C';

	if (articleField.name) {

		let json = '{"$and":[{"operationType": {"$ne": "D"}},';
		json = json + '{"name": "' + articleField.name + '"}]}';
		let where;
		try {
			where = JSON.parse(json);
		} catch (err) {
			fileController.writeLog(req, res, next, 500, json);
			fileController.writeLog(req, res, next, 500, err);
			return res.status(500).send(constants.ERR_SERVER);
		}

		ArticleField.find(where).exec((err, articleFields) => {
			if (err) {
				fileController.writeLog(req, res, next, 500, err);
				return res.status(500).send(constants.ERR_SERVER);
			} else {
				if (!articleFields || articleFields.length === 0) {
					articleField.save((err, articleFieldSaved) => {
						if (err) {
							fileController.writeLog(req, res, next, 500, err);
							return res.status(500).send(constants.ERR_SERVER);
						} else {
							// SYNC WOO
							axios.post(
								`${config.BASE_URL_V8}/woo/sync-article-field/${articleFieldSaved._id}`,
								{},
								{ headers: { 'Authorization': req.headers.authorization } }
							)
								.then(function (response) {
								})
								.catch(function (error) {
								});
							getArticleField(req, res, next, articleFieldSaved._id);
						}
					});
				} else {
					let message = 'El campo de producto \"' + articleField.name + '\" ya existe';
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

function updateArticleField(req, res, next) {

	initConnectionDB(req.session.database);

	let articleFieldId = req.query.id;
	let articleField = req.body;

	let user = new User();
	user._id = req.session.user;
	articleField.updateUser = user;
	articleField.updateDate = moment().format('YYYY-MM-DDTHH:mm:ssZ');
	articleField.operationType = 'U';

	if (articleField.name) {

		let json = '{"$and":[{"operationType": {"$ne": "D"}},';
		json = json + '{"name": "' + articleField.name + '"},';
		json = json + '{"_id": {"$ne": "' + articleFieldId + '"}}]}';
		let where;
		try {
			where = JSON.parse(json);
		} catch (err) {
			fileController.writeLog(req, res, next, 500, json);
			fileController.writeLog(req, res, next, 500, err);
			return res.status(500).send(constants.ERR_SERVER);
		}

		ArticleField.find(where).exec((err, articleFields) => {
			if (err) {
				fileController.writeLog(req, res, next, 500, err);
				return res.status(500).send(constants.ERR_SERVER);
			} else {
				if (!articleFields || articleFields.length === 0) {
					ArticleField.findByIdAndUpdate(articleFieldId, articleField, (err, articleFieldUpdated) => {
						if (err) {
							fileController.writeLog(req, res, next, 500, err);
							return res.status(500).send(constants.ERR_SERVER);
						} else {
							// SYNC WOO
							axios.post(
								`${config.BASE_URL_V8}/woo/sync-article-field/${articleFieldUpdated._id}`,
								{},
								{ headers: { 'Authorization': req.headers.authorization } }
							)
								.then(function (response) {
								})
								.catch(function (error) {
								});
							getArticleField(req, res, next, articleFieldUpdated._id);
						}
					});
				} else {
					let message = 'El campo de producto \"' + articleField.name + '\" ya existe';
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

function deleteArticleField(req, res, next) {

	initConnectionDB(req.session.database);

	let articleFieldId = req.query.id;

	let user = new User();
	user._id = req.session.user;

	ArticleField.findByIdAndUpdate(articleFieldId,
		{
			$set: {
				updateUser: user,
				updateDate: moment().format('YYYY-MM-DDTHH:mm:ssZ'),
				operationType: 'D'
			}
		}, (err, articleFieldUpdated) => {
			if (err) {
				fileController.writeLog(req, res, next, 500, err);
				return res.status(500).send(constants.ERR_SERVER);
			} else {
				// SYNC WOO
				axios.post(
					`${config.BASE_URL_V8}/woo/sync-article-field/${articleFieldUpdated._id}`,
					{},
					{ headers: { 'Authorization': req.headers.authorization } }
				)
					.then(function (response) {
					})
					.catch(function (error) {
					});
				fileController.writeLog(req, res, next, 200, articleFieldUpdated._id);
				return res.status(200).send({ articleField: articleFieldUpdated })
			}
		});
}

function initConnectionDB(database) {

	const Model = require('./../models/model');

	let ArticleFieldSchema = require('./../models/article-field');
	ArticleField = new Model('article-field', {
		schema: ArticleFieldSchema,
		connection: database
	});

	let UserSchema = require('./../models/user');
	User = new Model('user', {
		schema: UserSchema,
		connection: database
	});
}

module.exports = {
	getArticleField,
	getArticleFields,
	getArticleFieldsV2,
	saveArticleField,
	updateArticleField,
	deleteArticleField
}