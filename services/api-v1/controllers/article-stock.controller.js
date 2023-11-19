'use strict'

let fileController = require('./file.controller');
let constants = require('./../utilities/constants');
const { EJSON } = require('bson');

let moment = require('moment');
moment.locale('es');

let ArticleStock;
let Article;
let User;
let Make;
let Category;
let Branch;
let Deposit;
let MovementOfArticle;

// METODOS ASYNC
function save(req, res, next, articleStock) {

	return new Promise((resolve, reject) => {

		initConnectionDB(req.session.database);

		let user = new User();
		user._id = req.session.user;
		articleStock.creationUser = user;
		articleStock.creationDate = moment().format('YYYY-MM-DDTHH:mm:ssZ');
		articleStock.operationType = 'C';

		let json = '{"$and":[{"operationType": {"$ne": "D"}},';
		if (articleStock.branch && articleStock.branch._id) {
			json = json + '{"branch": "' + articleStock.branch._id + '"},';
		} else {
			json = json + '{"branch": "' + articleStock.branch + '"},';
		}
		if (articleStock.deposit && articleStock.deposit._id) {
			json = json + '{"deposit": "' + articleStock.deposit._id + '"},';
		} else {
			json = json + '{"deposit": "' + articleStock.deposit + '"},';
		}
		if (articleStock.article && articleStock.article._id) {
			json = json + '{"article": "' + articleStock.article._id + '"}';
		} else {
			json = json + '{"article": "' + articleStock.article + '"}';
		}
		json = json + ']}';
		let where;
		try {
			where = JSON.parse(json);
		} catch (err) {
			reject(err);
		}

		ArticleStock.find(where).exec((err, articleStocks) => {
			if (err) {
				reject(err);
			} else {
				if (!articleStocks || articleStocks.length === 0) {
					articleStock.save((err, articleStockSaved) => {
						if (err) {
							reject(err);
						} else {
							if (articleStockSaved) {
								resolve(articleStockSaved);
							} else {
								reject(articleStockSaved);
							}
						}
					});
				} else {
					let message = 'El stock del producto \"' + articleStock.code + '\" ya existe';
					reject({ message: message });
				}
			}
		});
	});
}

async function update(req, res, next, articleStockId, articleStock) {

	return new Promise(async (resolve, reject) => {

		initConnectionDB(req.session.database);

		let user = new User();
		user._id = req.session.user;
		articleStock.updateUser = user;
		articleStock.updateDate = moment().format('YYYY-MM-DDTHH:mm:ssZ');
		articleStock.operationType = 'U';

		let json = '{"$and":[{"operationType": {"$ne": "D"}},';
		if (articleStock.branch && articleStock.branch._id) {
			json = json + '{"branch": "' + articleStock.branch._id + '"},';
		} else {
			json = json + '{"branch": "' + articleStock.branch + '"},';
		}
		if (articleStock.deposit && articleStock.deposit._id) {
			json = json + '{"deposit": "' + articleStock.deposit._id + '"},';
		} else {
			json = json + '{"deposit": "' + articleStock.deposit + '"},';
		}
		if (articleStock.article && articleStock.article._id) {
			json = json + '{"article": "' + articleStock.article._id + '"},';
		} else {
			json = json + '{"article": "' + articleStock.article + '"},';
		}
		json = json + '{"_id": {"$ne": "' + articleStockId + '"}}]}';
		let where;
		try {
			where = JSON.parse(json);
		} catch (err) {
			fileController.writeLog(req, res, next, 500, json);
			reject(err);
		}

		await ArticleStock.find(where).exec(async (err, articleStocks) => {
			if (err) {
				reject(err);
			} else {
				if (!articleStocks || articleStocks.length === 0) {
					await ArticleStock.findByIdAndUpdate(articleStockId, articleStock, { new: true }, (err, articleStockUpdated) => {
						if (err) {
							reject(err);
						} else {
							if (articleStockUpdated) {
								resolve(articleStockUpdated);
							} else {
								reject(articleStockUpdated);
							}
						}
					});
				} else {
					let message = 'El stock del producto \"' + articleStock.code + '\" ya existe';
					reject({ message: message });
				}
			}
		});
	});
}

// METODOS PARA FRONTED
function getArticleStock(req, res, next, id = undefined) {

	initConnectionDB(req.session.database);

	let articleStockId;
	if (id) {
		articleStockId = id;
	} else {
		articleStockId = req.query.id;
	}

	ArticleStock.findById(articleStockId, (err, articleStock) => {
		if (err) {
			fileController.writeLog(req, res, next, 500, err);
			return res.status(500).send(constants.ERR_SERVER);
		} else {
			if (!articleStock || articleStock.operationType == 'D') {
				fileController.writeLog(req, res, next, 404, constants.NO_DATA_FOUND);
				return res.status(404).send(constants.NO_DATA_FOUND);
			} else {
				fileController.writeLog(req, res, next, 200, articleStock);
				return res.status(200).send({ articleStock: articleStock });
			}
		}
	}).populate({
		path: 'article',
		model: Article
	}).populate({
		path: 'branch',
		model: Branch
	}).populate({
		path: 'deposit',
		model: Deposit
	});
}

function getArticleStocks(req, res, next) {

	//http://localhost:3000/api/articleStocks/limit=6&skip=0&select=description,code&sort="code":1&where="description":"s"

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
	ArticleStock.find(where)
		.limit(limit)
		.select(select)
		.sort(sort)
		.skip(skip)
		.populate({
			path: 'article',
			model: Article,
			populate: [{
				path: 'make',
				model: Make
			}, {
				path: 'category',
				model: Category
			}]
		}).populate({
			path: 'branch',
			model: Branch
		}).populate({
			path: 'deposit',
			model: Deposit
		})
		.exec((err, articleStocks) => {
			if (err) {
				fileController.writeLog(req, res, next, 500, err);
				return res.status(500).send(constants.ERR_SERVER);
			} else {
				let articleStocksAux = new Array();
				for (let articleStock of articleStocks) {
					if (articleStock.article &&
						articleStock.article.operationType &&
						articleStock.article.operationType !== 'D') {
						articleStocksAux.push(articleStock);
					}
				}
				if (articleStocksAux) {
					fileController.writeLog(req, res, next, 200, articleStocksAux.length);
				}
				return res.status(200).send({ articleStocks: articleStocksAux });
			}
		});
}

function getArticleStocksV2(req, res, next) {

	initConnectionDB(req.session.database);

	let queryAggregate = [];
	let group;

	if (req.query && req.query !== {}) {

		let error;

		let project = req.query.project;
		if (project && project !== {} && project !== "{}") {
			try {
				project = JSON.parse(project);

				if (searchPropertyOfArray(project, 'article.')) {
					queryAggregate.push({ $lookup: { from: "articles", foreignField: "_id", localField: "article", as: "article" } });
					queryAggregate.push({ $unwind: { path: "$article", preserveNullAndEmptyArrays: true } });

					if (searchPropertyOfArray(project, 'article.category.')) {
						queryAggregate.push({ $lookup: { from: "categories", foreignField: "_id", localField: "article.category", as: "article.category" } });
						queryAggregate.push({ $unwind: { path: "$article.category", preserveNullAndEmptyArrays: true } });
					}

					if (searchPropertyOfArray(project, 'article.make.')) {
						queryAggregate.push({ $lookup: { from: "makes", foreignField: "_id", localField: "article.make", as: "article.make" } });
						queryAggregate.push({ $unwind: { path: "$article.make", preserveNullAndEmptyArrays: true } });
					}

					if (searchPropertyOfArray(project, 'article.applications.') || searchPropertyOfArray(project, 'applicationsName')) {
						queryAggregate.push({ $lookup: { from: "applications", foreignField: "_id", localField: "article.applications", as: "article.applications" } });
					}

					if (searchPropertyOfArray(project, 'article.unitOfMeasurement.')) {
						queryAggregate.push({ $lookup: { from: "unit-of-measurements", foreignField: "_id", localField: "article.unitOfMeasurement", as: "article.unitOfMeasurement" } });
						queryAggregate.push({ $unwind: { path: "$article.unitOfMeasurement", preserveNullAndEmptyArrays: true } });
					}

					if (JSON.stringify(project).includes('article.otherFields')) {
						queryAggregate.push(
							{
								$lookup: {
									from: "article-fields",
									localField: "article.otherFields.articleField",
									foreignField: "_id",
									as: "articleFieldDetails"
								}
							},
							{
								$addFields: {
									otherFields: {
										$map: {
											input: "$otherFields",
											as: "o",
											in: {
												$mergeObjects: [
													"$$o",
													{
														articleField: {
															$arrayElemAt: [
																{
																	$filter: {
																		input: "$articleFieldDetails",
																		as: "od",
																		cond: {
																			$eq: ["$$od._id", "$$o.articleField"]
																		}
																	}
																}, 0
															]
														}
													}
												]
											}
										}
									}
								}
							}
						);
					}
				}

				if (searchPropertyOfArray(project, 'branch.')) {
					queryAggregate.push({ $lookup: { from: "branches", foreignField: "_id", localField: "branch", as: "branch" } });
					queryAggregate.push({ $unwind: { path: "$branch", preserveNullAndEmptyArrays: true } });
				}

				if (searchPropertyOfArray(project, 'article.currency.')) {
					queryAggregate.push({ $lookup: { from: "currencies", foreignField: "_id", localField: "article.currency", as: "article.currency" } });
					queryAggregate.push({ $unwind: { path: "$article.currency", preserveNullAndEmptyArrays: true } });
				}

				if (searchPropertyOfArray(project, 'articleproviders.') || searchPropertyOfArray(project, 'providersName')) {
					queryAggregate.push({ $lookup: { from: "companies", foreignField: "_id", localField: "article.providers", as: "article.providers" } });
				}
				if (searchPropertyOfArray(project, 'articleprovider.') || searchPropertyOfArray(project, 'providerName')) {
					queryAggregate.push({ $lookup: { from: "companies", foreignField: "_id", localField: "article.provider", as: "article.provider" } });
				}

				if (searchPropertyOfArray(project, 'deposit.')) {
					queryAggregate.push({ $lookup: { from: "deposits", foreignField: "_id", localField: "deposit", as: "deposit" } });
					queryAggregate.push({ $unwind: { path: "$deposit", preserveNullAndEmptyArrays: true } });
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
						if (searchPropertyOfArray(JSON.parse(group), 'articleStocks')) {
							projectGroup = `{ "articleStocks": { "$slice": ["$articleStocks", ${skip}, ${limit}] }`;
						} else {
							projectGroup = `{ "items": { "$slice": ["$items", ${skip}, ${limit}] }`;
						}
						for (let prop of Object.keys(JSON.parse(group))) {
							if (prop !== 'articleStocks' && prop !== 'items') {
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

	ArticleStock.aggregate(queryAggregate)
		.allowDiskUse(true)
		.then(function (result) {
			fileController.writeLog(req, res, next, 200, result.length);
			if (result.length > 0) {
				if (group && group !== "{}" && group !== {}) {
					return res.status(200).send(result);
				} else {
					return res.status(200).send({ articleStocks: result });
				}
			} else {
				if (group && group !== "{}" && group !== {}) {
					return res.status(200).send({ count: 0, articleStocks: [] });
				} else {
					return res.status(200).send({ articleStocks: [] });
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

async function saveArticleStock(req, res, next) {

	initConnectionDB(req.session.database);

	let params = req.body;

	let articleStock = new ArticleStock();
	articleStock.article = params.article;
	articleStock.branch = params.branch;
	articleStock.deposit = params.deposit;
	articleStock.realStock = params.realStock;
	articleStock.minStock = params.minStock;

	await save(req, res, next, articleStock).then(
		articleStock => {
			fileController.writeLog(req, res, next, 200, articleStock._id);
			return res.status(200).send({ articleStock: articleStock });
		}
	).catch(
		err => {
			fileController.writeLog(req, res, next, 500, err);
			return res.status(500).send(constants.ERR_SERVER);
		}
	);
}

async function updateArticleStock(req, res, next) {

	initConnectionDB(req.session.database);

	let articleStockId = req.query.id;
	let articleStock = req.body;

	await update(req, res, next, articleStockId, articleStock).then(
		articleStock => {
			getArticleStock(req, res, next, articleStock._id);
		}
	).catch(
		err => {
			fileController.writeLog(req, res, next, 500, err);
			return res.status(500).send(constants.ERR_SERVER);
		}
	);
}

function deleteArticleStock(req, res, next) {

	initConnectionDB(req.session.database);

	let articleStockId = req.query.id;

	let user = new User();
	user._id = req.session.user;

	ArticleStock.findByIdAndUpdate(articleStockId,
		{
			$set: {
				updateUser: user,
				updateDate: moment().format('YYYY-MM-DDTHH:mm:ssZ'),
				operationType: 'D'
			}
		}, (err, articleStockUpdated) => {
			if (err) {
				fileController.writeLog(req, res, next, 500, err);
				return res.status(500).send(constants.ERR_SERVER);
			} else {
				fileController.writeLog(req, res, next, 200, articleStockUpdated._id);
				return res.status(200).send({ articleStock: articleStockUpdated });
			}
		});
}

async function updateStockByArticle(req, res, next, movementOfArticle = undefined) {

	let MovementOfArticleController = require('./movement-of-article.controller');
	let TransactionController = require('./transaction.controller');
	let DepositController = require('./deposit.controller');

	initConnectionDB(req.session.database);

	let isFinish = false;
	let params = req.body;
	let transaction;

	if (!movementOfArticle) {
		movementOfArticle = params.movementOfArticle;
	}

	if (!isFinish) {
		let transactionId;
		if (movementOfArticle.transaction && movementOfArticle.transaction._id && movementOfArticle.transaction._id !== '') {
			transactionId = movementOfArticle.transaction._id;
		} else {
			transactionId = movementOfArticle.transaction;
		}
		await TransactionController.get(req.session.database, transactionId).then(
			result => {
				if (!result || result.operationType == 'D') {
					isFinish = true;
					fileController.writeLog(req, res, next, 404, constants.NO_DATA_FOUND);
					return res.status(404).send(constants.NO_DATA_FOUND);
				} else {
					transaction = result;
				}
			}
		).catch(
			err => {
				isFinish = true;
				fileController.writeLog(req, res, next, 500, err);
				return res.status(500).send(constants.ERR_SERVER);
			}
		);
	}

	if (!isFinish) {
		let depositId;
		if (movementOfArticle.deposit && movementOfArticle.deposit._id && movementOfArticle.deposit._id !== '') {
			depositId = movementOfArticle.deposit._id;
		} else if (movementOfArticle.deposit) {
			depositId = movementOfArticle.deposit;
		}
		if (depositId) {
			await DepositController.get(req, res, next, depositId).then(
				deposit => {
					if (!deposit || deposit.operationType == 'D') {
						isFinish = true;
						fileController.writeLog(req, res, next, 404, constants.NO_DATA_FOUND);
						return res.status(404).send(constants.NO_DATA_FOUND);
					} else {
						movementOfArticle.deposit = deposit;
					}
				}
			).catch(
				err => {
					isFinish = true;
					fileController.writeLog(req, res, next, 500, err);
					return res.status(500).send(constants.ERR_SERVER);
				}
			);
		} else {
			fileController.writeLog(req, res, next, 500, "Debe asignar depósito al movimiento de artículo.");
			return res.status(200).send({ message: "Debe asignar depósito al movimiento de artículo." });
		}
	}

	let quantityForStock;
	let movementOfArticleDestination;
	let where;
	let articleStock = new ArticleStock();

	if (!isFinish) {
		let json = '{"$and":[{"operationType": {"$ne": "D"}},';
		json = json + '{"deposit": "' + movementOfArticle.deposit._id + '"},';
		json = json + '{"article": "' + movementOfArticle.article._id + '"}]}';
		try {
			where = JSON.parse(json);
		} catch (err) {
			isFinish = true;
			fileController.writeLog(req, res, next, 500, json);
			fileController.writeLog(req, res, next, 500, err);
			return res.status(500).send(constants.ERR_SERVER);
		}
	}

	if (!isFinish) {
		ArticleStock.find(where)
			.exec(async (err, articleStocks) => {
				if (err) {
					isFinish = true;
					fileController.writeLog(req, res, next, 500, err);
					return res.status(500).send(constants.ERR_SERVER);
				} else {
					if (!articleStocks || articleStocks.length === 0) {
						articleStock.article = movementOfArticle.article;
						articleStock.branch = movementOfArticle.deposit.branch;
						articleStock.deposit = movementOfArticle.deposit;
						articleStock.minStock = 0;

						if (movementOfArticle.stockMovement === 'Entrada' ||
							movementOfArticle.stockMovement === 'Inventario') {
							quantityForStock = movementOfArticle.amount;
						} else if (movementOfArticle.stockMovement === 'Transferencia') {
							// VALIDAMOS SI TIENE MISMO ORIGEN, SE RESTA LA CANTIDAD PARA STOCK, SI ES EL DESTINO SE SUMA
							let equalsOrigin = false;
							if (transaction.branchOrigin &&
								movementOfArticle.deposit.branch) {
								if (transaction.branchOrigin._id &&
									movementOfArticle.deposit.branch._id &&
									transaction.branchOrigin._id.toString() == movementOfArticle.deposit.branch._id.toString()) {
									equalsOrigin = true;
								} else if (!transaction.branchOrigin._id &&
									movementOfArticle.deposit.branch._id &&
									transaction.branchOrigin.toString() == movementOfArticle.deposit.branch._id.toString()) {
									equalsOrigin = true;
								} else if (!transaction.branchOrigin._id &&
									!movementOfArticle.deposit.branch._id &&
									transaction.branchOrigin.toString() == movementOfArticle.deposit.branch.toString()) {
									equalsOrigin = true;
								} else if (transaction.branchOrigin._id &&
									!movementOfArticle.deposit.branch._id &&
									transaction.branchOrigin._id.toString() == movementOfArticle.deposit.branch.toString()) {
									equalsOrigin = true;
								}
							}

							if (equalsOrigin) {
								quantityForStock = movementOfArticle.amount * -1;
								// DUPLICAMOS EL MOV OF ARTICLE PARA TRANSFERENCIA
								if (movementOfArticle.stockMovement === 'Transferencia') {
									let mov = new MovementOfArticle();
									let _id = mov._id;
									Object.assign(mov, movementOfArticle);
									mov._id = _id;
									mov.quantityForStock = 0;
									mov.deposit = transaction.depositDestination;

									await MovementOfArticleController.save(req, res, next, mov).then(
										mov => {
											movementOfArticleDestination = mov;
										}
									).catch(
										err => {
											isFinish = true;
											fileController.writeLog(req, res, next, 500, err);
											return res.status(500).send(constants.ERR_SERVER);
										}
									);
								}
							} else {
								quantityForStock = movementOfArticle.amount;
							}
						} else {
							quantityForStock = movementOfArticle.amount * -1;
						}

						if (!isFinish) {
							articleStock.realStock = quantityForStock;
							await save(req, res, next, articleStock).then(
								async articleStock => {
									movementOfArticle.quantityForStock = quantityForStock;
									await MovementOfArticleController.update(req, res, next, movementOfArticle._id, movementOfArticle).then(
										movementOfArticle => {
											if (movementOfArticleDestination) {
												updateStockByArticle(req, res, next, movementOfArticleDestination);
											} else {
												getArticleStock(req, res, next, articleStock._id);
											}
										}
									).catch(
										err => {
											isFinish = true;
											fileController.writeLog(req, res, next, 500, err);
											return res.status(500).send(constants.ERR_SERVER);
										}
									);
								}
							).catch(
								err => {
									isFinish = true;
									fileController.writeLog(req, res, next, 500, err);
									return res.status(500).send(constants.ERR_SERVER);
								}
							);
						}
					} else {
						articleStock = articleStocks[0];
						let equalsOrigin = false;
						if (movementOfArticle.stockMovement === 'Inventario') {
							if (!isNaN(movementOfArticle.quantityForStock)) articleStock.realStock += movementOfArticle.quantityForStock;
							quantityForStock = (articleStock.realStock - movementOfArticle.amount) * -1;
						} else if (movementOfArticle.stockMovement === 'Entrada') {
							quantityForStock = movementOfArticle.amount;
						} else if (movementOfArticle.stockMovement === 'Transferencia') {
							// VALIDAMOS SI TIENE MISMO ORIGEN, SE RESTA LA CANTIDAD PARA STOCK, SI ES EL DESTINO SE SUMA
							if (transaction.branchOrigin &&
								movementOfArticle.deposit.branch) {
								if (transaction.branchOrigin._id &&
									movementOfArticle.deposit.branch._id &&
									transaction.branchOrigin._id.toString() == movementOfArticle.deposit.branch._id.toString()) {
									equalsOrigin = true;
								} else if (!transaction.branchOrigin._id &&
									movementOfArticle.deposit.branch._id &&
									transaction.branchOrigin.toString() == movementOfArticle.deposit.branch._id.toString()) {
									equalsOrigin = true;
								} else if (!transaction.branchOrigin._id &&
									!movementOfArticle.deposit.branch._id &&
									transaction.branchOrigin.toString() == movementOfArticle.deposit.branch.toString()) {
									equalsOrigin = true;
								} else if (transaction.branchOrigin._id &&
									!movementOfArticle.deposit.branch._id &&
									transaction.branchOrigin._id.toString() == movementOfArticle.deposit.branch.toString()) {
									equalsOrigin = true;
								}
							}
							if (!equalsOrigin) {
								quantityForStock = movementOfArticle.amount;
							} else {
								quantityForStock = movementOfArticle.amount * -1;
							}
						} else {
							quantityForStock = movementOfArticle.amount * -1;
						}

						if (!isFinish) {
							if (!isNaN(movementOfArticle.quantityForStock) &&
								movementOfArticle.quantityForStock !== quantityForStock) {
								let diff = 0;
								if (!isNaN(movementOfArticle.quantityForStock)) {
									diff += movementOfArticle.quantityForStock;
								};
								articleStock.realStock += quantityForStock - diff;
								// DUPLICAMOS EL MOV OF ARTICLE PARA TRANSFERENCIA
								if (equalsOrigin && movementOfArticle.stockMovement === 'Transferencia') {
									let mov = new MovementOfArticle();
									let _id = mov._id;
									Object.assign(mov, movementOfArticle);
									mov._id = _id;
									mov.amount = movementOfArticle.amount + diff;
									mov.quantityForStock = 0;
									mov.deposit = transaction.depositDestination;
									await MovementOfArticleController.save(req, res, next, mov).then(
										mov => {
											movementOfArticleDestination = mov;
										}
									).catch(
										err => {
											isFinish = true;
											fileController.writeLog(req, res, next, 500, err);
											return res.status(500).send(constants.ERR_SERVER);
										}
									);
								}

								if (!isFinish) {
									await update(req, res, next, articleStock._id, articleStock).then(
										async articleStock => {
											movementOfArticle.quantityForStock = quantityForStock;
											await MovementOfArticleController.update(req, res, next, movementOfArticle._id, movementOfArticle).then(
												movementOfArticle => {
													if (movementOfArticleDestination) {
														updateStockByArticle(req, res, next, movementOfArticleDestination);
													} else {
														getArticleStock(req, res, next, articleStock._id);
													}
												}
											).catch(
												err => {
													isFinish = true;
													fileController.writeLog(req, res, next, 500, err);
													return res.status(500).send(constants.ERR_SERVER);
												}
											);
										}
									).catch(
										err => {
											isFinish = true;
											fileController.writeLog(req, res, next, 500, err);
											return res.status(500).send(constants.ERR_SERVER);
										}
									);
								}
							} else {
								if (movementOfArticle.stockMovement === 'Inventario') {
									await MovementOfArticleController.update(req, res, next, movementOfArticle._id, movementOfArticle).then(
										movementOfArticle => {
											getArticleStock(req, res, next, articleStock._id);
										}
									).catch(
										err => {
											isFinish = true;
											fileController.writeLog(req, res, next, 500, err);
											return res.status(500).send(constants.ERR_SERVER);
										}
									);
								} else {
									getArticleStock(req, res, next, articleStock._id);
								}
							}
						}
					}
				}
			});
	}
}

function initConnectionDB(database) {

	const Model = require('./../models/model');

	let ArticleStockSchema = require('./../models/article-stock');
	ArticleStock = new Model('article-stock', {
		schema: ArticleStockSchema,
		connection: database
	});

	let ArticleSchema = require('./../models/article');
	Article = new Model('article', {
		schema: ArticleSchema,
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

	let BranchSchema = require('./../models/branch');
	Branch = new Model('branch', {
		schema: BranchSchema,
		connection: database
	});

	let DespositSchema = require('./../models/deposit');
	Deposit = new Model('deposit', {
		schema: DespositSchema,
		connection: database
	});

	let UserSchema = require('./../models/user');
	User = new Model('user', {
		schema: UserSchema,
		connection: database
	});

	let MovementOfArticleSchema = require('./../models/movement-of-article');
	MovementOfArticle = new Model('movements-of-article', {
		schema: MovementOfArticleSchema,
		connection: database
	});
}

module.exports = {
	save,
	update,
	getArticleStock,
	getArticleStocks,
	getArticleStocksV2,
	saveArticleStock,
	updateArticleStock,
	deleteArticleStock,
	updateStockByArticle
}