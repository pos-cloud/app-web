'use strict'

let fileController = require('./file.controller');
let constants = require('./../utilities/constants');
const { EJSON } = require('bson');
let moment = require('moment');
moment.locale('es');

let User;
let Variant;
let VariantType;
let VariantValue;
let Article;
let Deposit;
let Branch;
let Category;
let Make;

function getVariant(req, res, next, id = undefined) {

	initConnectionDB(req.session.database);

	let variantId;
	if (id) {
		variantId = id;
	} else {
		variantId = req.query.id;
	}

	Variant.findById(variantId, (err, variant) => {
		if (err) {
			fileController.writeLog(req, res, next, 500, err);
			return res.status(500).send(constants.ERR_SERVER);
		} else {
			if (!variant || variant.operationType == 'D') {
				fileController.writeLog(req, res, next, 404, constants.NO_DATA_FOUND);
				return res.status(404).send(constants.NO_DATA_FOUND);
			} else {
				fileController.writeLog(req, res, next, 200, variant);
				return res.status(200).send({ variant: variant });
			}
		}
	}).populate({
		path: 'type',
		model: VariantType
	}).populate({
		path: 'value',
		model: VariantValue
	}).populate({
		path: 'articleParent',
		model: Article
	}).populate({
		path: 'articleChild',
		model: Article,
		populate: [{
			path: 'deposits.deposit',
			model: Deposit,
			populate: [{
				path: 'deposits.deposit.branch',
				model: Branch,
			}]
		}, {
			path: 'category',
			model: Category
		}, {
			path: 'make',
			model: Make
		}]
	});
}

function getVariants(req, res, next) {

	//http://localhost:3000/api/variants/limit=6&skip=0&select=value,code&sort="code":1&where="value":"s"

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

	Variant.find(where)
		.limit(limit)
		.select(select)
		.sort(sort)
		.skip(skip)
		.populate({
			path: 'type',
			model: VariantType,
			options: { sort: { 'order': 1 } }
		}).populate({
			path: 'value',
			model: VariantValue,
			options: { sort: { 'order': 1 } }
		}).populate({
			path: 'articleParent',
			model: Article
		}).populate({
			path: 'articleChild',
			model: Article,
			populate: [{
				path: 'deposits.deposit',
				model: Deposit,
				populate: [{
					path: 'branch',
					model: Branch,
				}]
			}, {
				path: 'category',
				model: Category
			}, {
				path: 'make',
				model: Make
			}]
		})
		.exec((err, variants) => {
			if (err) {
				fileController.writeLog(req, res, next, 500, err);
				return res.status(500).send(constants.ERR_SERVER);
			} else {
				if (!variants || variants.length === 0) {
					fileController.writeLog(req, res, next, 200, constants.NO_DATA_FOUND);
					return res.status(200).send({ message: constants.NO_DATA_FOUND });
				} else {
					fileController.writeLog(req, res, next, 200, 'Variant ' + variants.length);
					return res.status(200).send({ variants: variants });
				}
			}
		});
}

function getVariantsV2(req, res, next) {

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
					queryAggregate.push({ $lookup: { from: "variant-types", foreignField: "_id", localField: "type", as: "type" } });
					queryAggregate.push({ $unwind: { path: "$type", preserveNullAndEmptyArrays: true } });
				}

				if (searchPropertyOfArray(project, 'value.')) {
					queryAggregate.push({ $lookup: { from: "variant-values", foreignField: "_id", localField: "value", as: "value" } });
					queryAggregate.push({ $unwind: { path: "$value", preserveNullAndEmptyArrays: true } });
				}

				if (searchPropertyOfArray(project, 'articleParent.')) {
					queryAggregate.push({ $lookup: { from: "articles", foreignField: "_id", localField: "articleParent", as: "articleParent" } });
					queryAggregate.push({ $unwind: { path: "$articleParent", preserveNullAndEmptyArrays: true } });
				}

				if (searchPropertyOfArray(project, 'articleChild.')) {
					queryAggregate.push({ $lookup: { from: "articles", foreignField: "_id", localField: "articleChild", as: "articleChild" } });
					queryAggregate.push({ $unwind: { path: "$articleChild", preserveNullAndEmptyArrays: true } });
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
						if (searchPropertyOfArray(JSON.parse(group), 'variants')) {
							projectGroup = `{ "variants": { "$slice": ["$variants", ${skip}, ${limit}] }`;
						} else {
							projectGroup = `{ "items": { "$slice": ["$items", ${skip}, ${limit}] }`;
						}
						for (let prop of Object.keys(JSON.parse(group))) {
							if (prop !== 'variants' && prop !== 'items') {
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

	Variant.aggregate(queryAggregate)
		.then(function (result) {
			fileController.writeLog(req, res, next, 200, result.length);
			if (result.length > 0) {
				if (group && group !== "{}" && group !== {}) {
					return res.status(200).send(result);
				} else {
					return res.status(200).send({ variants: result });
				}
			} else {
				if (group && group !== "{}" && group !== {}) {
					return res.status(200).send({ count: 0, variants: [] });
				} else {
					return res.status(200).send({ variants: [] });
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

async function saveVariant(req, res, next, variantAux) {

	return new Promise((resolve, reject) => {

		initConnectionDB(req.session.database);

		let isValid = true;
		let variant = new Variant();
		variant.type = variantAux.type;
		variant.value = variantAux.value;
		variant.articleParent = variantAux.articleParent;
		variant.articleChild = variantAux.articleChild;

		let user = new User();
		user._id = req.session.user;
		variant.creationUser = user;
		variant.creationDate = moment().format('YYYY-MM-DDTHH:mm:ssZ');
		variant.operationType = 'C';

		if (!variant.type) {
			isValid = false;
			let message = "Debe completar el campo tipo de variante";
			resolve({ message: message });
		}
		if (!variant.value) {
			isValid = false;
			let message = "Debe completar el campo valor de variante";
			resolve({ message: message });
		}

		if (!variant.articleParent) {
			isValid = false;
			let message = "Debe completar el campo artículo padre";
			resolve({ message: message });
		}
		if (!variant.articleChild) {
			isValid = false;
			let message = "Debe completar el campo artículo hijo";
			resolve({ message: message });
		}

		if (isValid) {
			let json = '{"$and":[{"operationType": {"$ne": "D"}},';
			if (variant.articleParent && variant.articleParent._id) {
				json = json + '{"articleParent": "' + variant.articleParent._id + '"},';
			} else {
				json = json + '{"articleParent": "' + variant.articleParent + '"},';
			}
			if (variant.articleChild && variant.articleChild._id) {
				json = json + '{"articleChild": "' + variant.articleChild._id + '"},';
			} else {
				json = json + '{"articleChild": "' + variant.articleChild + '"},';
			}
			json = json + '{"value": "' + variant.value + '"}]}';
			let where;
			try {
				where = JSON.parse(json);
			} catch (err) {
				fileController.writeLog(req, res, next, 500, json);
				reject(err);
			}

			Variant.find(where).exec((err, variants) => {
				if (err) {
					reject(err);
				} else {
					if (!variants || variants.length === 0) {
						variant.save((err, variantSaved) => {
							if (err) {
								reject(err);
							} else {
								resolve({ variant: variantSaved });
							}
						});
					} else {
						let message = 'La variante ya existe';
						resolve({ message: message });
					}
				}
			});
		}
	});
}

function updateVariant(req, res, next) {

	initConnectionDB(req.session.database);

	let variantId = req.query.id;
	let variant = req.body;

	let user = new User();
	user._id = req.session.user;
	variant.updateUser = user;
	variant.updateDate = moment().format('YYYY-MM-DDTHH:mm:ssZ');
	variant.operationType = 'U';

	if (variant.type &&
		variant.value &&
		variant.articleParent &&
		variant.articleChild) {

		let json = '{"$and":[{"operationType": {"$ne": "D"}},';
		json = json + '{"articleParent": "' + variant.articleParent + '"},';
		json = json + '{"articleChild": "' + variant.articleChild + '"},';
		json = json + '{"value": "' + variant.value + '"},';
		json = json + '{"_id": {"$ne": "' + variantId + '"}}]}';
		let where;
		try {
			where = JSON.parse(json);
		} catch (err) {
			fileController.writeLog(req, res, next, 500, json);
			fileController.writeLog(req, res, next, 500, err);
			return res.status(500).send(constants.ERR_SERVER);
		}

		Variant.find(where).exec((err, variants) => {
			if (err) {
				fileController.writeLog(req, res, next, 500, err);
				return res.status(500).send(constants.ERR_SERVER);
			} else {
				if (!variants || variants.length === 0) {
					Variant.findByIdAndUpdate(variantId, variant, (err, variantUpdated) => {
						if (err) {
							fileController.writeLog(req, res, next, 500, err);
							return res.status(500).send(constants.ERR_SERVER);
						} else {
							getVariant(req, res, next, variantUpdated._id);
						}
					});
				} else {
					let message = 'La variante ya existe';
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

async function deleteVariant(req, res, next) {

	initConnectionDB(req.session.database);

	let variantId = req.query.id;

	let user = new User();
	user._id = req.session.user;

	Variant.findByIdAndUpdate(variantId,
		{
			$set: {
				updateUser: user,
				updateDate: moment().format('YYYY-MM-DDTHH:mm:ssZ'),
				operationType: 'D'
			}
		}, (err, variantUpdated) => {
			if (err) {
				fileController.writeLog(req, res, next, 500, err);
				return res.status(500).send(constants.ERR_SERVER);
			} else {
				Variant.findById(variantId, (err, variantAux) => {
					if (err) {
						fileController.writeLog(req, res, next, 500, err);
						return res.status(500).send(constants.ERR_SERVER);
					} else {
						Article.populate(variantAux, { path: 'articleParent' }, async (err, variantAux) => {
							if (err) {
								fileController.writeLog(req, res, next, 500, err);
								return res.status(500).send(constants.ERR_SERVER);
							} else {
								await getVariantsByArticle(req, res, next, variantAux.articleChild, null);
							}
						});
					}
				});
			}
		});
}

//Si existen variants con operationType distinto de 'D' la elimina
async function getVariantsByArticle(req, res, next, articleChild, articleParent) {

	return new Promise((resolve, reject) => {

		initConnectionDB(req.session.database);

		let json = '{"$and":[{"operationType": {"$ne": "D"}},';
		if (articleChild) {
			json = json + '{"articleChild": "' + articleChild._id + '"}]}';
		} else if (articleParent) {
			json = json + '{"articleParent": "' + articleParent._id + '"}]}';
		} else {
			resolve({ message: "Debe seleccionar un artículo" });
		}
		let where;
		try {
			where = JSON.parse(json);
		} catch (err) {
			fileController.writeLog(req, res, next, 500, json);
			reject(err);
		}

		Variant.find(where)
			.populate({
				path: 'articleParent',
				model: Article
			})
			.populate({
				path: 'articleChild',
				model: Article
			})
			.populate({
				path: 'type',
				model: VariantType
			})
			.populate({
				path: 'value',
				model: VariantValue
			})
			.exec((err, variants) => {
				if (err) {
					reject(err);
				} else {
					resolve({ variants: variants });
				}
			});
	});
}

async function deleteVariantByArticleParent(req, res, next, articleParent) {

	return new Promise(async (resolve, reject) => {

		initConnectionDB(req.session.database);

		let user = new User();
		user._id = req.session.user;

		Variant.updateMany({ articleParent: articleParent },
			{
				$set: {
					updateUser: user,
					updateDate: moment().format('YYYY-MM-DDTHH:mm:ssZ'),
					operationType: "D"
				}
			}, async (err, result) => {
				if (err) {
					reject(constants.ERR_SERVER);
				} else {
					Variant.find({ articleParent: articleParent })
						.populate({
							path: 'articleChild',
							model: Article
						})
						.populate({
							path: 'articleParent',
							model: Article
						})
						.exec(async (err, variants) => {
							if (err) {
								reject(constants.ERR_SERVER);
							} else {
								if (!variants) {
									resolve({ message: constants.NO_DATA_FOUND });
								} else if (variants.length === 0) {
									resolve({ message: constants.NO_DATA_FOUND });
								} else {
									let ArticleController = require('./article.controller');
									let varAux;
									for (let variantAux of variants) {
										varAux = variantAux;
										let result = await ArticleController.deleteAsync(req, res, next, variantAux.articleChild);
										if (result.err) {
											reject(constants.ERR_SERVER);
										} else if (result.message) {
											resolve({ message: result.message });
										}
									}
									return resolve({ article: varAux.articleParent });
								}
							}
						});
				}
			});
	});
}

function deleteVariantByArticleChild(req, res, next, articleChild) {

	return new Promise((resolve, reject) => {

		initConnectionDB(req.session.database);

		let user = new User();
		user._id = req.session.user;

		Variant.updateMany({ articleChild: articleChild },
			{
				$set: {
					updateUser: user,
					updateDate: moment().format('YYYY-MM-DDTHH:mm:ssZ'),
					operationType: "D"
				}
			}, (err, result) => {
				if (err) {
					reject(constants.ERR_SERVER);
				} else {
					Variant.find({ articleChild: articleChild })
						.populate({
							path: 'articleChild',
							model: Article
						})
						.populate({
							path: 'articleParent',
							model: Article
						})
						.exec(async (err, variants) => {
							if (err) {
								reject(constants.ERR_SERVER);
							} else {
								if (!variants || variants.length === 0) {
									resolve({ message: constants.NO_DATA_FOUND });
								} else {
									let ArticleController = require('./article.controller');
									let varAux;
									for (let variantAux of variants) {
										varAux = variantAux;
										let result = await ArticleController.deleteAsync(req, res, next, variantAux.articleChild);
										if (result.err) {
											reject(constants.ERR_SERVER);
										} else if (result.message) {
											resolve({ message: result.message });
										}
									}
									return resolve({ article: varAux.articleParent });
								}
							}
						});
				}
			});
	});
}

function initConnectionDB(database) {

	const Model = require('./../models/model');

	let VariantTypeSchema = require('./../models/variant-type');
	VariantType = new Model('variant-type', {
		schema: VariantTypeSchema,
		connection: database
	});

	let VariantValueSchema = require('./../models/variant-value');
	VariantValue = new Model('variant-value', {
		schema: VariantValueSchema,
		connection: database
	});

	let VariantSchema = require('./../models/variant');
	Variant = new Model('variant', {
		schema: VariantSchema,
		connection: database
	});

	let ArticleSchema = require('./../models/article');
	Article = new Model('article', {
		schema: ArticleSchema,
		connection: database
	});

	let UserSchema = require('./../models/user');
	User = new Model('user', {
		schema: UserSchema,
		connection: database
	});

	let DepositSchema = require('./../models/deposit');
	Deposit = new Model('deposit', {
		schema: DepositSchema,
		connection: database
	});

	let BranchSchema = require('./../models/branch');
	Branch = new Model('branch', {
		schema: BranchSchema,
		connection: database
	});

	let MakeSchema = require('./../models/make');
	Make = new Model('make', {
		schema: MakeSchema,
		connection: database
	});

	let CategorySchema = require('./../models/category');
	Category = new Model('category', {
		schema: CategorySchema,
		connection: database
	});
}

module.exports = {
	getVariant,
	getVariants,
	getVariantsV2,
	saveVariant,
	updateVariant,
	deleteVariant,
	deleteVariantByArticleParent,
	deleteVariantByArticleChild,
	getVariantsByArticle
}