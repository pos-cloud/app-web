'use strict'

let fileController = require('./file.controller');
let constants = require('./../utilities/constants');
let moment = require('moment');
moment.locale('es');
const { EJSON } = require('bson');

let User;
let HModel;

function getHModel(req, res, next, hmodel, id = undefined) {

	if (!hmodel) {
		hmodel = req.query.hmodel;
	}

	initConnectionDB(req.session.database, hmodel);

	let hmodelId;
	if (id) {
		hmodelId = id;
	} else {
		hmodelId = req.query.id;
	}

	HModel.findById(hmodelId, (err, hmodel) => {
		if (err) {
			fileController.writeLog(req, res, next, 500, err);
			return res.status(500).send(constants.ERR_SERVER);
		} else {
			User.populate(hmodel, { path: 'creationUser' }, (err, hmodel) => {
				if (err) {
					fileController.writeLog(req, res, next, 500, err);
					return res.status(500).send(constants.ERR_SERVER);
				} else {
					User.populate(hmodel, { path: 'updateUser' }, (err, hmodel) => {
						if (err) {
							fileController.writeLog(req, res, next, 500, err);
							return res.status(500).send(constants.ERR_SERVER);
						} else {
							if (!hmodel || hmodel.operationType == 'D') {
								fileController.writeLog(req, res, next, 404, constants.NO_DATA_FOUND);
								return res.status(404).send(constants.NO_DATA_FOUND);
							} else {
								fileController.writeLog(req, res, next, 200, hmodel);
								return res.status(200).send({ hmodel: hmodel });
							}
						}
					});
				}
			});
		}
	});
}

function getHModels(req, res, next) {

	//http://localhost:3000/api/hmodels/limit=6&skip=0&select=description,code&sort="code":1&where="description":"s"
	let hmodel = req.query.hmodel;
	initConnectionDB(req.session.database, hmodel);

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

	HModel.find(where).
		limit(limit).
		select(select).
		sort(sort).
		skip(skip).
		exec((err, hmodels) => {
			if (err) {
				fileController.writeLog(req, res, next, 500, err);
				return res.status(500).send(constants.ERR_SERVER);
			} else {
				User.populate(hmodels, { path: 'creationUser' }, (err, hmodels) => {
					if (err) {
						fileController.writeLog(req, res, next, 500, err);
						return res.status(500).send(constants.ERR_SERVER);
					} else {
						User.populate(hmodels, { path: 'updateUser' }, (err, hmodels) => {
							if (err) {
								fileController.writeLog(req, res, next, 500, err);
								return res.status(500).send(constants.ERR_SERVER);
							} else {
								if (!hmodels) {
									fileController.writeLog(req, res, next, 404, constants.NO_DATA_FOUND);
									return res.status(404).send(constants.NO_DATA_FOUND);
								} else if (hmodels.length === 0) {
									fileController.writeLog(req, res, next, 200, constants.NO_DATA_FOUND);
									return res.status(200).send({ message: constants.NO_DATA_FOUND });
								} else {
									fileController.writeLog(req, res, next, 200, hmodel + " " + hmodels.length);
									return res.status(200).send({ hmodels: hmodels });
								}
							}
						});
					}
				});
			}
		});
}

function getHModelsV2(req, res, next) {

    initConnectionDB(req.session.database, 'article');

    let queryAggregate = [];
    let group;

    if (req.query && req.query !== {}) {

        let error;

        let project = req.query.project;
        if (project && project !== {} && project !== "{}") {
            try {
                project = JSON.parse(project);

                if (JSON.stringify(project).includes('taxes')) {
                    queryAggregate.push(
                        {
                            $lookup: {
                                from: "taxes",
                                localField: "taxes.tax",
                                foreignField: "_id",
                                as: "taxDetails"
                            }
                        },
                        {
                            $addFields: {
                                taxes: {
                                    $map: {
                                        input: "$taxes",
                                        as: "t",
                                        in: {
                                            $mergeObjects: [
                                                "$$t",
                                                {
                                                    tax: {
                                                        $arrayElemAt: [
                                                            {
                                                                $filter: {
                                                                    input: "$taxDetails",
                                                                    as: "td",
                                                                    cond: {
                                                                        $eq: ["$$td._id", "$$t.tax"]
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

                if (JSON.stringify(project).includes('otherFields')) {
                    queryAggregate.push(
                        {
                            $lookup: {
                                from: "article-fields",
                                localField: "otherFields.articleField",
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

                if (searchPropertyOfArray(project, 'make.')) {
                    queryAggregate.push({ $lookup: { from: "makes", foreignField: "_id", localField: "make", as: "make" } });
                    queryAggregate.push({ $unwind: { path: "$make", preserveNullAndEmptyArrays: true } });
                }

                if (searchPropertyOfArray(project, 'category.')) {
                    queryAggregate.push({ $lookup: { from: "categories", foreignField: "_id", localField: "category", as: "category" } });
                    queryAggregate.push({ $unwind: { path: "$category", preserveNullAndEmptyArrays: true } });
                }

                if (searchPropertyOfArray(project, 'unitOfMeasurement.')) {
                    queryAggregate.push({ $lookup: { from: "units-of-measurements", foreignField: "_id", localField: "unitOfMeasurement", as: "unitOfMeasurement" } });
                    queryAggregate.push({ $unwind: { path: "$unitOfMeasurement", preserveNullAndEmptyArrays: true } });
                }

                if (searchPropertyOfArray(project, 'deposits')) {
                    queryAggregate.push({
                        $lookup: {
                            from: "deposits",
                            let: { pid: '$deposits.deposit' },
                            pipeline: [
                                { $match: { $expr: { $in: ['$_id', '$$pid'] } } }
                            ],
                            as: "deposits"
                        }
                    });
                }

                if (searchPropertyOfArray(project, 'applications.') || searchPropertyOfArray(project, 'applicationsName')) {
                    queryAggregate.push({ $lookup: { from: "applications", foreignField: "_id", localField: "applications", as: "applications" } });
                }

                if (searchPropertyOfArray(project, 'providers.') || searchPropertyOfArray(project, 'providersName')) {
                    queryAggregate.push({ $lookup: { from: "companies", foreignField: "_id", localField: "providers", as: "providers" } });
                }
                if (searchPropertyOfArray(project, 'provider.') || searchPropertyOfArray(project, 'providerName')) {
                    queryAggregate.push({ $lookup: { from: "companies", foreignField: "_id", localField: "provider", as: "provider" } });
                }

                if (searchPropertyOfArray(project, 'locations')) {
                    queryAggregate.push({
                        $lookup: {
                            from: "locations",
                            let: { pid: '$locations._id' },
                            pipeline: [
                                { $match: { $expr: { $in: ['$_id', '$$pid'] } } }
                            ],
                            as: "locations"
                        }
                    });
                }

                if (searchPropertyOfArray(project, 'currency.')) {
                    queryAggregate.push({ $lookup: { from: "currencies", foreignField: "_id", localField: "currency", as: "currency" } });
                    queryAggregate.push({ $unwind: { path: "$currency", preserveNullAndEmptyArrays: true } });
                }

                if (searchPropertyOfArray(project, 'creationUser.')) {
                    queryAggregate.push({ $lookup: { from: "users", foreignField: "_id", localField: "creationUser", as: "creationUser" } });
                    queryAggregate.push({ $unwind: { path: "$creationUser", preserveNullAndEmptyArrays: true } });
                }

                if (searchPropertyOfArray(project, 'updateUser.')) {
                    queryAggregate.push({ $lookup: { from: "users", foreignField: "_id", localField: "updateUser", as: "updateUser" } });
                    queryAggregate.push({ $unwind: { path: "$updateUser", preserveNullAndEmptyArrays: true } });
                }

                if (searchPropertyOfArray(project, 'salesAccount.')) {
                    queryAggregate.push({ $lookup: { from: "accounts", foreignField: "_id", localField: "salesAccount", as: "salesAccount" } });
                    queryAggregate.push({ $unwind: { path: "$salesAccount", preserveNullAndEmptyArrays: true } });
                }

                if (searchPropertyOfArray(project, 'purchaseAccount.')) {
                    queryAggregate.push({ $lookup: { from: "accounts", foreignField: "_id", localField: "purchaseAccount", as: "purchaseAccount" } });
                    queryAggregate.push({ $unwind: { path: "$purchaseAccount", preserveNullAndEmptyArrays: true } });
                }

                if (searchPropertyOfArray(project, 'harticle.')) {
                    queryAggregate.push({ $lookup: { from: "articles", foreignField: "_id", localField: "harticle", as: "harticle" } });
                    queryAggregate.push({ $unwind: { path: "$harticle", preserveNullAndEmptyArrays: true } });
                }

                if (searchPropertyOfArray(project, 'variants')) {
                    queryAggregate.push({
                        $lookup: {
                            from: "variants",
                            let: { pid: "$_id" },
                            pipeline: [
                                { $match: { $expr: { $eq: ["$articleParent", "$$pid"] }, operationType: { $ne: "D" } } },
                                {
                                    $lookup: {
                                        from: "variant-types",
                                        let: { pid: "$type" },
                                        pipeline: [
                                            { $match: { $expr: { $eq: ["$_id", "$$pid"] }, operationType: { $ne: "D" } } }
                                        ],
                                        as: "type"
                                    }
                                }, { $unwind: { path: "$type", preserveNullAndEmptyArrays: true } },
                                {
                                    $lookup: {
                                        from: "variant-values",
                                        let: { pid: "$value" },
                                        pipeline: [
                                            { $match: { $expr: { $eq: ["$_id", "$$pid"] }, operationType: { $ne: "D" } } }
                                        ],
                                        as: "value"
                                    }
                                }, { $unwind: { path: "$value", preserveNullAndEmptyArrays: true } },
                            ],
                            as: "variants"
                        }
                    });
                }

                if (searchPropertyOfArray(project, 'articleParent')) {
                    queryAggregate.push({
                        $lookup: {
                            from: "variants",
                            let: { pid: "$_id" },
                            pipeline: [
                                { $match: { $expr: { $eq: ["$articleChild", "$$pid"] } } },
                                { $project: { _id: "$articleParent" } }
                            ],
                            as: "articleParent"
                        }
                    });
                    queryAggregate.push({ $unwind: { path: "$articleParent", preserveNullAndEmptyArrays: true } });
                    queryAggregate.push({ $lookup: { from: "articles", foreignField: "_id", localField: "articleParent._id", as: "articleParent" } });
                    queryAggregate.push({ $unwind: { path: "$articleParent", preserveNullAndEmptyArrays: true } });
                }

                if (searchPropertyOfArray(project, 'priceLists')) {
                    queryAggregate.push(
                        {
                            $lookup: {
                                from: "price-lists",
                                let: {},
                                pipeline: [{
                                    $match: {
                                        operationType: { "$ne": "D" }
                                    }
                                }],
                                as: "priceLists"
                            }
                        }
                    )
                }

                if (searchPropertyOfArray(project, 'articleStocks.')) {
                    queryAggregate.push({ $lookup: { from: "article-stocks", foreignField: "article", localField: "_id", as: "articleStocks" } });
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
                        if (searchPropertyOfArray(JSON.parse(group), 'articles')) {
                            projectGroup = `{ "articles": { "$slice": ["$articles", ${skip}, ${limit}] }`;
                        } else {
                            projectGroup = `{ "items": { "$slice": ["$items", ${skip}, ${limit}] }`;
                        }
                        for (let prop of Object.keys(JSON.parse(group))) {
                            if (prop !== 'articles' && prop !== 'items') {
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

    HModel.aggregate(queryAggregate)
        .allowDiskUse(true)
        .then(function (result) {
            fileController.writeLog(req, res, next, 200, result.length);
            if (result.length > 0) {
                if (group && group !== "{}" && group !== {}) {
                    return res.status(200).send(result);
                } else {
                    return res.status(200).send({ articles: result });
                }
            } else {
                if (group && group !== "{}" && group !== {}) {
                    return res.status(200).send({ count: 0, articles: [] });
                } else {
                    return res.status(200).send({ articles: [] });
                }
            }
        }).catch(err => {
            fileController.writeLog(req, res, next, 500, err);
            return res.status(500).send(err);
        });
}

function saveHModel(req, res, next) {

	initConnectionDB(req.session.database, req.query.hmodel);

	let hmodel = new HModel();
	hmodel = req.body;
	let user = new User();
	user._id = req.session.user;
	hmodel.creationUser = user;
	hmodel.creationDate = moment().format('YYYY-MM-DDTHH:mm:ssZ');
	hmodel.operationType = 'C';
	hmodel.save((err, hmodelSaved) => {
		if (err) {
			fileController.writeLog(req, res, next, 500, err);
			return res.status(500).send(constants.ERR_SERVER);
		} else {
			getHModel(req, res, next, hmodel, hmodelSaved._id);
		}
	});
}

function updateHModel(req, res, next) {

	initConnectionDB(req.session.database);

	let hmodelId = req.query.id;
	let hmodel = req.body;

	let user = new User();
	user._id = req.session.user;
	hmodel.updateUser = user;
	hmodel.updateDate = moment().format('YYYY-MM-DDTHH:mm:ssZ');
	hmodel.operationType = 'U';

	HModel.findByIdAndUpdate(hmodelId, hmodel, (err, hmodelUpdated) => {
		if (err) {
			fileController.writeLog(req, res, next, 500, err);
			return res.status(500).send(constants.ERR_SERVER);
		} else {
			getHModel(req, res, next, hmodelUpdated._id);
		}
	});
}

function updateAsync(req, res, next, hmodel, hobject) {

	initConnectionDB(req.session.database, hmodel);

	return new Promise((resolve, reject) => {

		hobject.creationUser = req.session.user;
		hobject.creationDate = moment().format('YYYY-MM-DDTHH:mm:ssZ');
		hobject.operationType = 'U';

		HModel.useFindAndModify({ _id: hobject._id }, hobject, (err, hobjectUpdate) => {
			if (err) {
				reject(err);
			} else {
				resolve({ hobject: hobjectUpdate });
			}
		});
	});
}

function saveAsync(database, userId, hmodel, hobject) {

	initConnectionDB(database, hmodel);

	let object = new HModel();
    if(hobject) {
        for (let property in hobject._doc) {
            if (property != "_id") {
                object[property] = hobject[property];
            }
        }
        object['h' + hmodel] = hobject._id;
    }
	return new Promise((resolve, reject) => {
		let user = new User();
		user._id = userId;
		object.creationUser = user;
		object.creationDate = moment().format('YYYY-MM-DDTHH:mm:ssZ');
		object.operationType = 'C';
		object.save((err, hobjectSaved) => {
			if (err) {
				reject(err);
			} else {
				resolve({ hobject: hobjectSaved });
			}
		});
	});
}

function getAsync(database, hmodel, hobjectId) {

	initConnectionDB(database, hmodel);

	return new Promise((resolve, reject) => {
		HModel.findById(hobjectId, (err, hobject) => {
			if (err) {
				reject(err);
			} else {
				resolve({ hobject: hobject });
			}
		});
	});
}

function getsAsync(database, hmodel, where) {

	initConnectionDB(database, hmodel);

	return new Promise((resolve, reject) => {
		HModel.find(where).exec((err, hobjects) => {
			if (err) {
				reject(err);
			} else {
				resolve({ hobjects: hobjects });
			}
		});
	});
}

function searchPropertyOfArray(array, value) {
    let n = false;
    for (let a of Object.keys(array)) { if (!n) n = a.includes(value); }
    return n;
}

function initConnectionDB(database, hmodel) {

	const Model = require('./../models/model');

	let HModelSchema = require('./../models/' + hmodel);
	HModel = new Model('h' + hmodel, {
		schema: HModelSchema,
		connection: database
	});

	let UserSchema = require('./../models/user');
	User = new Model('user', {
		schema: UserSchema,
		connection: database
	});
}

module.exports = {
	getHModel,
	getHModels,
	getHModelsV2,
	saveHModel,
	updateHModel,
	getAsync,
	getsAsync,
	saveAsync,
	updateAsync
}