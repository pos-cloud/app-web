'use strict'

let fileController = require('./file.controller');
let constants = require('./../utilities/constants');
const { EJSON } = require('bson');
let path = require('path');
let moment = require('moment');
let fs = require('fs');
moment.locale('es');

let User;
let Make;
let MovementOfArticle;
let Application;

function getMake(req, res, next, id = undefined) {

    initConnectionDB(req.session.database);

    let makeId;
    if (id) {
        makeId = id;
    } else {
        makeId = req.query.id;
    }

    Make.findById(makeId, (err, make) => {
        if (err) {
            fileController.writeLog(req, res, next, 500, err);
            return res.status(500).send(constants.ERR_SERVER);
        } else {
            User.populate(make, { path: 'creationUser' }, (err, make) => {
                if (err) {
                    fileController.writeLog(req, res, next, 500, err);
                    return res.status(500).send(constants.ERR_SERVER);
                } else {
                    Application.populate(make, { path: 'applications' }, (err, make) => {
                        if (err) {
                            fileController.writeLog(req, res, next, 500, err);
                            return res.status(500).send(constants.ERR_SERVER);
                        } else {
                            User.populate(make, { path: 'updateUser' }, (err, make) => {
                                if (err) {
                                    fileController.writeLog(req, res, next, 500, err);
                                    return res.status(500).send(constants.ERR_SERVER);
                                } else {
                                    if (!make || make.operationType == 'D') {
                                        fileController.writeLog(req, res, next, 404, constants.NO_DATA_FOUND);
                                        return res.status(404).send(constants.NO_DATA_FOUND);
                                    } else {
                                        fileController.writeLog(req, res, next, 200, make);
                                        return res.status(200).send({ make: make });
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

function getMakes(req, res, next) {

    //http://localhost:3000/api/makes/limit=6&skip=0&select=description,code&sort="code":1&where="description":"s"

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

    Make.find(where).
        limit(limit).
        select(select).
        sort(sort).
        skip(skip).
        exec((err, makes) => {
            if (err) {
                fileController.writeLog(req, res, next, 500, err);
                return res.status(500).send(constants.ERR_SERVER);
            } else {
                User.populate(makes, { path: 'creationUser' }, (err, makes) => {
                    if (err) {
                        fileController.writeLog(req, res, next, 500, err);
                        return res.status(500).send(constants.ERR_SERVER);
                    } else {
                        User.populate(makes, { path: 'updateUser' }, (err, makes) => {
                            if (err) {
                                fileController.writeLog(req, res, next, 500, err);
                                return res.status(500).send(constants.ERR_SERVER);
                            } else {
                                if (!makes) {
                                    fileController.writeLog(req, res, next, 404, constants.NO_DATA_FOUND);
                                    return res.status(404).send(constants.NO_DATA_FOUND);
                                } else if (makes.length === 0) {
                                    fileController.writeLog(req, res, next, 200, constants.NO_DATA_FOUND);
                                    return res.status(200).send({ message: constants.NO_DATA_FOUND });
                                } else {
                                    fileController.writeLog(req, res, next, 200, 'Make ' + makes.length);
                                    return res.status(200).send({ makes: makes });
                                }
                            }
                        });
                    }
                });
            }
        });
}

function getMakesV2(req, res, next) {

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
                        if (searchPropertyOfArray(JSON.parse(group), 'makes')) {
                            projectGroup = `{ "makes": { "$slice": ["$makes", ${skip}, ${limit}] }`;
                        } else {
                            projectGroup = `{ "items": { "$slice": ["$items", ${skip}, ${limit}] }`;
                        }
                        for (let prop of Object.keys(JSON.parse(group))) {
                            if (prop !== 'makes' && prop !== 'items') {
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

    Make.aggregate(queryAggregate)
        .then(function (result) {
            fileController.writeLog(req, res, next, 200, result.length);
            if (result.length > 0) {
                if (group && group !== "{}" && group !== {}) {
                    return res.status(200).send(result);
                } else {
                    return res.status(200).send({ makes: result });
                }
            } else {
                if (group && group !== "{}" && group !== {}) {
                    return res.status(200).send({ count: 0, makes: [] });
                } else {
                    return res.status(200).send({ makes: [] });
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

function saveMake(req, res, next) {

    initConnectionDB(req.session.database);

    let make = new Make();
    let params = req.body;

    make.description = params.description;
    make.visibleSale = params.visibleSale;
    make.ecommerceEnabled = params.ecommerceEnabled;
    make.picture = params.picture;
    make.applications = params.applications;

    let user = new User();
    user._id = req.session.user;
    make.creationUser = user;
    make.creationDate = moment().format('YYYY-MM-DDTHH:mm:ssZ');
    make.operationType = 'C';

    if (make.description) {

        let json = '{"$and":[{"operationType": {"$ne": "D"}},';
        json = json + '{"description": "' + make.description + '"}]}';
        let where;
        try {
            where = JSON.parse(json);
        } catch (err) {
            fileController.writeLog(req, res, next, 500, json);
            fileController.writeLog(req, res, next, 500, err);
            return res.status(500).send(constants.ERR_SERVER);
        }

        Make.find(where).exec((err, makes) => {
            if (err) {
                fileController.writeLog(req, res, next, 500, err);
                return res.status(500).send(constants.ERR_SERVER);
            } else {
                if (!makes || makes.length === 0) {
                    make.save((err, makeSaved) => {
                        if (err) {
                            fileController.writeLog(req, res, next, 500, err);
                            return res.status(500).send(constants.ERR_SERVER);
                        } else {
                            getMake(req, res, next, makeSaved._id);
                        }
                    });
                } else {
                    let message = 'La marca \"' + make.description + '\" ya existe';
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

function updateMake(req, res, next) {

    initConnectionDB(req.session.database);

    let makeId = req.query.id;
    let make = req.body;

    let user = new User();
    user._id = req.session.user;
    make.updateUser = user;
    make.operationType = 'U';

    if (make.description) {

        let json = '{"$and":[{"operationType": {"$ne": "D"}},';
        json = json + '{"description": "' + make.description + '"},';
        json = json + '{"_id": {"$ne": "' + makeId + '"}}]}';
        let where;
        try {
            where = JSON.parse(json);
        } catch (err) {
            fileController.writeLog(req, res, next, 500, json);
            fileController.writeLog(req, res, next, 500, err);
            return res.status(500).send(constants.ERR_SERVER);
        }

        Make.find(where).exec((err, makes) => {
            if (err) {
                fileController.writeLog(req, res, next, 500, err);
                return res.status(500).send(constants.ERR_SERVER);
            } else {
                if (!makes || makes.length === 0) {
                    Make.findByIdAndUpdate(makeId, make, (err, makeUpdated) => {
                        if (err) {
                            fileController.writeLog(req, res, next, 500, err);
                            return res.status(500).send(constants.ERR_SERVER);
                        } else {
                            getMake(req, res, next, makeUpdated._id);
                        }
                    });
                } else {
                    let message = 'La marca \"' + make.description + '\" ya existe';
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

function deleteMake(req, res, next) {

    initConnectionDB(req.session.database);

    let makeId = req.query.id;

    let user = new User();
    user._id = req.session.user;

    Make.findByIdAndUpdate(makeId,
        {
            $set: {
                updateUser: user,
                updateDate: moment().format('YYYY-MM-DDTHH:mm:ssZ'),
                operationType: 'D'
            }
        }, (err, makeUpdated) => {
            if (err) {
                fileController.writeLog(req, res, next, 500, err);
                return res.status(500).send(constants.ERR_SERVER);
            } else {
                fileController.writeLog(req, res, next, 200, "Make " + makeUpdated);
                return res.status(200).send({ make: makeUpdated });
            }
        });
}

function getSalesByMake(req, res, next) {

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
            from: "makes",
            localField: "article.make",
            foreignField: "_id",
            as: "article.make"
        }
    });
    queryAggregate.push({
        $unwind: "$article.make"
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
            _id: "$article.make",
            count: { $sum: "$amount" },
            total: { $sum: "$salePrice" }
        }
    });
    queryAggregate.push({
        $project: {
            make: "$_id",
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

function uploadImage(req, res, next) {

    initConnectionDB(req.session.database);

    let makeId = req.params.id;

    if (req.file) {

        Make.findById(makeId, (err, make) => {
            if (err) {
                fileController.writeLog(req, res, next, 500, err);
                return res.status(500).send(constants.ERR_SERVER);
            } else {
                let imageToDelete = make.picture;
                Make.findByIdAndUpdate(makeId, { picture: req.file.filename }, (err, makeUpdated) => {
                    if (err) {
                        fileController.writeLog(req, res, next, 500, err);
                        return res.status(500).send(constants.ERR_SERVER);
                    } else {
                        deleteImage(imageToDelete, req.session.database)
                        getMake(req, res, next, makeUpdated._id);
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
            return res.sendFile(path.resolve('/home/clients/' + req.params.database + '/images/make/' + picture));
        } catch (err) {
            fileController.writeLog(req, res, next, 404, constants.NO_IMAGEN_FOUND);
            return res.status(404).send(constants.NO_IMAGEN_FOUND);
        }
    }
}

function deleteImage(picture, database) {

    if (picture && picture != 'default.jpg') {
        try {
            fs.unlinkSync('/home/clients/' + database + '/images/make/' + picture);
        } catch (err) {
        }
    };
}

function initConnectionDB(database) {

    const Model = require('./../models/model');

    let MakeSchema = require('./../models/make');
    Make = new Model('make', {
        schema: MakeSchema,
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
    getMake,
    getMakes,
    getMakesV2,
    saveMake,
    updateMake,
    deleteMake,
    getSalesByMake,
    uploadImage,
    getImage
}