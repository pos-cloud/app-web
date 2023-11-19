'use strict'

let fs = require('fs');
let path = require('path');
let fileController = require('./file.controller');
let constants = require('./../utilities/constants');
const { EJSON } = require('bson');
let moment = require('moment');
moment.locale('es');

let Category;
let User;
let MovementOfArticle;
let Application;

function getCategory(req, res, next, id = undefined) {

    initConnectionDB(req.session.database);

    let categoryId;
    if (id) {
        categoryId = id;
    } else {
        categoryId = req.query.id;
    }

    Category.findById(categoryId, (err, category) => {
        if (err) {
            fileController.writeLog(req, res, next, 500, err);
            return res.status(500).send(constants.ERR_SERVER);
        } else {
            User.populate(category, { path: 'creationUser' }, (err, category) => {
                if (err) {
                    fileController.writeLog(req, res, next, 500, err);
                    return res.status(500).send(constants.ERR_SERVER);
                } else {
                    Category.populate(category, { path: 'parent' }, (err, category) => {
                        if (err) {
                            fileController.writeLog(req, res, next, 500, err);
                            return res.status(500).send(constants.ERR_SERVER);
                        } else {
                            Application.populate(category, { path: 'applications' }, (err, category) => {
                                if (err) {
                                    fileController.writeLog(req, res, next, 500, err);
                                    return res.status(500).send(constants.ERR_SERVER);
                                } else {
                                    User.populate(category, { path: 'updateUser' }, (err, category) => {
                                        if (err) {
                                            fileController.writeLog(req, res, next, 500, err);
                                            return res.status(500).send(constants.ERR_SERVER);
                                        } else {
                                            if (!category || category.operationType == 'D') {
                                                fileController.writeLog(req, res, next, 404, constants.NO_DATA_FOUND);
                                                return res.status(404).send(constants.NO_DATA_FOUND);
                                            } else if (category === undefined) {
                                                fileController.writeLog(req, res, next, 200, constants.NO_DATA_FOUND);
                                                return res.status(200).send({ message: constants.NO_DATA_FOUND });
                                            } else {
                                                fileController.writeLog(req, res, next, 200, category);
                                                return res.status(200).send({ category: category });
                                            }
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            });
        }
    });
}

function getCategories(req, res, next) {

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
                    json += "{" + item[1] + "}]}";
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

    Category.find(where).
        limit(limit).
        select(select).
        sort(sort).
        skip(skip).
        exec((err, categories) => {
            if (err) {
                fileController.writeLog(req, res, next, 500, err);
                return res.status(500).send(constants.ERR_SERVER);
            } else {
                User.populate(categories, { path: 'creationUser' }, (err, categories) => {
                    if (err) {
                        fileController.writeLog(req, res, next, 500, err);
                        return res.status(500).send(constants.ERR_SERVER);
                    } else {
                        Category.populate(categories, { path: 'parent' }, (err, categories) => {
                            if (err) {
                                fileController.writeLog(req, res, next, 500, err);
                                return res.status(500).send(constants.ERR_SERVER);
                            } else {
                                Application.populate(categories, { path: 'applications' }, (err, categories) => {
                                    if (err) {
                                        fileController.writeLog(req, res, next, 500, err);
                                        return res.status(500).send(constants.ERR_SERVER);
                                    } else {
                                        User.populate(categories, { path: 'updateUser' }, (err, categories) => {
                                            if (err) {
                                                fileController.writeLog(req, res, next, 500, err);
                                                return res.status(500).send(constants.ERR_SERVER);
                                            } else {
                                                if (!categories) {
                                                    fileController.writeLog(req, res, next, 404, constants.NO_DATA_FOUND);
                                                    return res.status(404).send(constants.NO_DATA_FOUND);
                                                } else if (categories.length === 0) {
                                                    fileController.writeLog(req, res, next, 200, constants.NO_DATA_FOUND);
                                                    return res.status(200).send({ message: constants.NO_DATA_FOUND });
                                                } else {
                                                    if (categories) {
                                                        fileController.writeLog(req, res, next, 200, categories.length);
                                                    }
                                                    return res.status(200).send({ categories: categories });
                                                }
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
}

function getCategoriesV2(req, res, next) {

    initConnectionDB(req.session.database);

    let queryAggregate = [];
    let group;

    if (req.query && req.query !== {}) {

        let error;

        let project = req.query.project;
        if (project && project !== {} && project !== "{}") {
            try {
				project = JSON.parse(project);
				
				if (searchPropertyOfArray(project, 'applications.') || searchPropertyOfArray(project, 'applicationsName')) {
					queryAggregate.push({ $lookup: { from: "applications", foreignField: "_id", localField: "applications", as: "applications" } });
				}

                if (searchPropertyOfArray(project, 'creationUser.')) {
                    queryAggregate.push({ $lookup: { from: "users", foreignField: "_id", localField: "creationUser", as: "creationUser" } });
                    queryAggregate.push({ $unwind: { path: "$creationUser", preserveNullAndEmptyArrays: true } });
                }

                if (searchPropertyOfArray(project, 'parent.')) {
                    queryAggregate.push({ $lookup: { from: "categories", foreignField: "_id", localField: "parent", as: "parent" } });
                    queryAggregate.push({ $unwind: { path: "$parent", preserveNullAndEmptyArrays: true } });
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
                        if (searchPropertyOfArray(JSON.parse(group), 'categories')) {
                            projectGroup = `{ "categories": { "$slice": ["$categories", ${skip}, ${limit}] }`;
                        } else {
                            projectGroup = `{ "items": { "$slice": ["$items", ${skip}, ${limit}] }`;
                        }
                        for (let prop of Object.keys(JSON.parse(group))) {
                            if (prop !== 'categories' && prop !== 'items') {
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

	Category.aggregate(queryAggregate)
        .then(function (result) {
            fileController.writeLog(req, res, next, 200, result.length);
            if (result.length > 0) {
                if (group && group !== "{}" && group !== {}) {
                    return res.status(200).send(result);
                } else {
                    return res.status(200).send({ categories: result });
                }
            } else {
                if (group && group !== "{}" && group !== {}) {
                    return res.status(200).send({ count: 0, categories: [] });
                } else {
                    return res.status(200).send({ categories: [] });
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

function saveCategory(req, res, next) {

    initConnectionDB(req.session.database);

    let category = new Category();
    let params = req.body;

    category.order = params.order;
    category.description = params.description;
    category.ecommerceEnabled = params.ecommerceEnabled;
    category.visibleInvoice = params.visibleInvoice;
    category.visibleOnSale = params.visibleOnSale;
    category.visibleOnPurchase = params.visibleOnPurchase;
    category.isRequiredOptional = params.isRequiredOptional;
    category.parent = params.parent;
    category.applications = params.applications;
    category.favourite = params.favourite;


    let user = new User();
    user._id = req.session.user;
    category.creationUser = user;
    category.creationDate = moment().format('YYYY-MM-DDTHH:mm:ssZ');
    category.operationType = 'C';

    if (category.description) {

        let json = '{"$and":[{"operationType": {"$ne": "D"}},';
        json = json + '{"description": "' + category.description + '"}]}';
        let where;
        try {
            where = JSON.parse(json);
        } catch (err) {
            fileController.writeLog(req, res, next, 500, json);
            fileController.writeLog(req, res, next, 500, err);
            return res.status(500).send(constants.ERR_SERVER);
        }

        Category.find(where).exec((err, categories) => {
            if (err) {
                fileController.writeLog(req, res, next, 500, err);
                return res.status(500).send(constants.ERR_SERVER);
            } else {
                if (!categories || categories.length === 0) {
                    category.save((err, categorySaved) => {
                        if (err) {
                            fileController.writeLog(req, res, next, 500, err);
                            return res.status(500).send(constants.ERR_SERVER);
                        } else {
                            getCategory(req, res, next, categorySaved._id);
                        }
                    });
                } else {
                    let message = 'La categoría \"' + category.description + '\" ya existe';
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

function updateCategory(req, res, next) {

    initConnectionDB(req.session.database);

    let categoryId = req.query.id;
    let category = req.body;

    let user = new User();
    user._id = req.session.user;
    category.updateUser = user;
    category.updateDate = moment().format('YYYY-MM-DDTHH:mm:ssZ');
    category.operationType = 'U';

    if (category.description) {

        let json = '{"$and":[{"operationType": {"$ne": "D"}},';
        json = json + '{"description": "' + category.description + '"},';
        json = json + '{"_id": {"$ne": "' + categoryId + '"}}]}';
        let where;
        try {
            where = JSON.parse(json);
        } catch (err) {
            fileController.writeLog(req, res, next, 500, json);
            fileController.writeLog(req, res, next, 500, err);
            return res.status(500).send(constants.ERR_SERVER);
        }

        Category.find(where).exec((err, categories) => {
            if (err) {
                fileController.writeLog(req, res, next, 500, err);
                return res.status(500).send(constants.ERR_SERVER);
            } else {
                if (!categories || categories.length === 0) {
                    Category.findByIdAndUpdate(categoryId, category, (err, categoryUpdated) => {
                        if (err) {
                            fileController.writeLog(req, res, next, 500, err);
                            return res.status(500).send(constants.ERR_SERVER);
                        } else {
                            getCategory(req, res, next, categoryUpdated._id);
                        }
                    });
                } else {
                    let message = 'La categoría \"' + category.description + '\" ya existe';
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

function deleteCategory(req, res, next) {

    initConnectionDB(req.session.database);

    let categoryId = req.query.id;

    let user = new User();
    user._id = req.session.user;

    Category.findByIdAndUpdate(categoryId,
        {
            $set: {
                updateUser: user,
                updateDate: moment().format('YYYY-MM-DDTHH:mm:ssZ'),
                operationType: 'D'
            }
        }, (err, categoryUpdated) => {
            if (err) {
                fileController.writeLog(req, res, next, 500, err);
                return res.status(500).send(constants.ERR_SERVER);
            } else {
                deleteImage(categoryUpdated.picture, req.session.database);
                fileController.writeLog(req, res, next, 200, categoryUpdated._id);
                return res.status(200).send({ category: categoryUpdated })
            }
        });
}

function uploadImage(req, res, next) {

    initConnectionDB(req.session.database);

    let categoryId = req.params.id;

    if (req.file) {

        Category.findById(categoryId, (err, category) => {
            if (err) {
                fileController.writeLog(req, res, next, 500, err);
                return res.status(500).send(constants.ERR_SERVER);
            } else {
                let imageToDelete = category.picture;
                Category.findByIdAndUpdate(categoryId, {  picture: req.file.filename }, (err, categoryUpdated) => {
                    if (err) {
                        fileController.writeLog(req, res, next, 500, err);
                        return res.status(500).send(constants.ERR_SERVER);
                    } else {
                        deleteImage(imageToDelete, req.session.database)
                        getCategory(req, res, next, categoryUpdated._id);
                    }
                });
            }
        });
    } else {
        fileController.writeLog(req, res, next, 404, constants.NO_IMAGEN_FOUND);
        return res.status(404).send(constants.NO_IMAGEN_FOUND);
    }
}

function getImage(req, res, next) {

    let picture = req.params.picture;

    if (picture && picture !== undefined) {
        try {
            return res.sendFile(path.resolve('/home/clients/' + req.params.database + '/images/category/' + picture));
        } catch (err) {
            fileController.writeLog(req, res, next, 404, constants.NO_IMAGEN_FOUND);
            return res.status(404).send(constants.NO_IMAGEN_FOUND);
        }
    }
}


function deleteImage(picture, database) {

    if (picture && picture != 'default.jpg') {
        try {
            fs.unlinkSync('/home/clients/' + database + '/images/category/' + picture);
        } catch (err) {
        }
    };
}

function getSalesByCategory(req, res, next) {

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
            from: "articles",
            localField: "article",
            foreignField: "_id",
            as: "article"
        }
    });
    queryAggregate.push({
        $unwind: "$article"
    });
    queryAggregate.push({
        $lookup:
        {
            from: "categories",
            localField: "article.category",
            foreignField: "_id",
            as: "article.category"
        }
    });
    queryAggregate.push({
        $unwind: "$article.category"
    });
    queryAggregate.push({
        $lookup:
        {
            from: "transactions",
            localField: "transaction",
            foreignField: "_id",
            as: "transaction"
        }
    });
    queryAggregate.push({
        $unwind: "$transaction"
    });
    queryAggregate.push({
        $match: {
            $and: [
                {
                    "transaction.endDate": {
                        $gte: new Date(startDate)
                    }
                },
                {
                    "transaction.endDate": {
                        $lte: new Date(endDate)
                    }
                },
                {
                    "transaction.state": "Cerrado",
                },
                {
                    "transaction.operationType": { "$ne": "D" }
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
                "transaction.branchDestination": mongoose.Types.ObjectId(branch)
            }
        });
    }
    queryAggregate.push({
        $lookup:
        {
            from: "transaction-types",
            localField: "transaction.type",
            foreignField: "_id",
            as: "transaction.type"
        }
    });
    queryAggregate.push({
        $unwind: "$transaction.type"
    });
    queryAggregate.push({
        $match:
        {
            $and:
                [
                    {
                        "transaction.type.transactionMovement": type,
                        "transaction.type.currentAccount": currentAccount,
                        "transaction.type.modifyStock": modifyStock
                    }
                ],
        }
    });
    queryAggregate.push({
        $project: {
            article: "$article",
            amount: {
                $cond:
                    [
                        {
                            $and:
                                [
                                    { $eq: ["$transaction.type.movement", "Entrada"] }
                                ]
                        }, "$amount", { $multiply: ["$amount", -1] }
                    ],
            },
            salePrice: {
                $cond:
                    [
                        {
                            $and:
                                [
                                    { $eq: ["$transaction.type.movement", "Entrada"] }
                                ]
                        }, "$salePrice", { $multiply: ["$salePrice", -1] }
                    ],
            },
        }
    });
    queryAggregate.push({
        $group: {
            _id: "$article.category",
            count: { $sum: "$amount" },
            total: { $sum: "$salePrice" }
        }
    });
    queryAggregate.push({
        $project: {
            category: "$_id",
            count: 1,
            total: 1
        }
    });
    queryAggregate.push({ $sort: sort });

    if (limit && limit != 0) {
        queryAggregate.push({ $limit: limit });
    }

    MovementOfArticle.aggregate(queryAggregate).
        then(function (result) {
            fileController.writeLog(req, res, next, 200, result.length);
            return res.status(200).send(result);
        }).catch(err => {
            fileController.writeLog(req, res, next, 500, err);
            return res.status(500).send(err);
        });
}

function initConnectionDB(database) {

    const Model = require('./../models/model');

    let CategorySchema = require('./../models/category');
    Category = new Model('category', {
        schema: CategorySchema,
        connection: database
    });

    let MovementOfArticleSchema = require('./../models/movement-of-article');
    MovementOfArticle = new Model('movements-of-article', {
        schema: MovementOfArticleSchema,
        connection: database
    });

    let UserSchema = require('./../models/user');
    User = new Model('user', {
        schema: UserSchema,
        connection: database
    });

    let ApplicationSchema = require('./../models/application');
    Application = new Model('application', {
        schema: ApplicationSchema,
        connection: database
    });
}

module.exports = {
    getCategory,
    getCategories,
    getCategoriesV2,
    saveCategory,
    updateCategory,
    deleteCategory,
    uploadImage,
    getImage,
    getSalesByCategory,
}