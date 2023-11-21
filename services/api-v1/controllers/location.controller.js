'use strict'

let fileController = require('./file.controller');
let constants = require('./../utilities/constants');
const { EJSON } = require('bson');
let moment = require('moment');
moment.locale('es');

let User;
let Location;
let Deposit;

function getLocation(req, res, next, id = undefined) {

    initConnectionDB(req.session.database);

    let locationId;
    if (id) {
        locationId = id;
    } else {
        locationId = req.query.id;
    }

    Location.findById(locationId, (err, location) => {
        if (err) {
            fileController.writeLog(req, res, next, 500, err);
            return res.status(500).send(constants.ERR_SERVER);
        } else {
            if (!location || location.operationType == 'D') {
                fileController.writeLog(req, res, next, 404, constants.NO_DATA_FOUND);
                return res.status(404).send(constants.NO_DATA_FOUND);
            } else {
                fileController.writeLog(req, res, next, 200, location);
                return res.status(200).send({ location: location });
            }
        }
    }).populate({
        path: 'deposit',
        model: Deposit
    }).populate({
        path: 'creationUser',
        model: User
    }).populate({
        path: 'updateUser',
        model: User
    });
}

function getLocations(req, res, next) {

    //http://localhost:3000/api/locations/limit=6&skip=0&select=name,code&sort="code":1&where="name":"s"


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

    Location.find(where).
        limit(limit).
        select(select).
        sort(sort).
        skip(skip)
        .populate({
            path: 'deposit',
            model: Deposit
        })
        .exec((err, locations) => {
            if (err) {
                fileController.writeLog(req, res, next, 500, err);
                return res.status(500).send(constants.ERR_SERVER);
            } else {
                if (!locations) {
                    fileController.writeLog(req, res, next, 404, constants.NO_DATA_FOUND);
                    return res.status(404).send(constants.NO_DATA_FOUND);
                } else if (locations.length === 0) {
                    fileController.writeLog(req, res, next, 200, constants.NO_DATA_FOUND);
                    return res.status(200).send({ message: constants.NO_DATA_FOUND });
                } else {
                    fileController.writeLog(req, res, next, 200, 'Location ' + locations.length);
                    return res.status(200).send({ locations: locations });
                }
            }
        });
}

function getLocationsV2(req, res, next) {

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

                if (searchPropertyOfArray(project, 'deposit.')) {
                    queryAggregate.push({ $lookup: { from: "deposits", foreignField: "_id", localField: "deposit", as: "deposit" } });
                    queryAggregate.push({ $unwind: { path: "$deposit", preserveNullAndEmptyArrays: true } });
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
                        if (searchPropertyOfArray(JSON.parse(group), 'locations')) {
                            projectGroup = `{ "locations": { "$slice": ["$locations", ${skip}, ${limit}] }`;
                        } else {
                            projectGroup = `{ "items": { "$slice": ["$items", ${skip}, ${limit}] }`;
                        }
                        for (let prop of Object.keys(JSON.parse(group))) {
                            if (prop !== 'locations' && prop !== 'items') {
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

    Location.aggregate(queryAggregate)
        .then(function (result) {
            fileController.writeLog(req, res, next, 200, result.length);
            if (result.length > 0) {
                if (group && group !== "{}" && group !== {}) {
                    return res.status(200).send(result);
                } else {
                    return res.status(200).send({ locations: result });
                }
            } else {
                if (group && group !== "{}" && group !== {}) {
                    return res.status(200).send({ count: 0, locations: [] });
                } else {
                    return res.status(200).send({ locations: [] });
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

function saveLocation(req, res, next) {

    initConnectionDB(req.session.database);

    let location = new Location();
    let params = req.body;

    let user = new User();
    user._id = req.session.user;
    location.creationUser = user;
    location.operationType = 'C';
    location.description = params.description;
    location.positionX = params.positionX;
    location.positionY = params.positionY;
    location.positionZ = params.positionZ;
    location.deposit = params.deposit;

    if (location.description && location.deposit) {


        location.save((err, locationSave) => {
            if (err) {
                fileController.writeLog(req, res, next, 500, err);
                return res.status(500).send(constants.ERR_SERVER);
            } else {
                getLocation(req, res, next, locationSave._id);
            }
        });
    } else {
        fileController.writeLog(req, res, next, 200, constants.COMPLETE_ALL_THE_DATA);
        return res.status(200).send({ message: constants.COMPLETE_ALL_THE_DATA });
    }
}

function updateLocation(req, res, next) {

    initConnectionDB(req.session.database);

    let locationId = req.query.id;
    let location = req.body;

    let user = new User();
    user._id = req.session.user;
    location.updateUser = user;
    location.operationType = 'U';

    if (location.description && location.deposit) {

        let json = '{"$and":[{"operationType": {"$ne": "D"}},';
        if (location.deposit && location.deposit._id) {
            json = json + '{"deposit": "' + location.deposit._id + '"},';
        } else {
            json = json + '{"deposit": "' + location.deposit + '"},';
        }
        json = json + '{"description": "' + location.description + '"}]}';

        let where;
        try {
            where = JSON.parse(json);
        } catch (err) {
            fileController.writeLog(req, res, next, 500, json);
            fileController.writeLog(req, res, next, 500, err);
            return res.status(500).send(constants.ERR_SERVER);
        }

        Location.find(where).exec((err, locations) => {
            if (err) {
                fileController.writeLog(req, res, next, 500, err);
                return res.status(500).send(constants.ERR_SERVER);
            } else {
                if (!locations || locations.length === 0) {
                    Location.findByIdAndUpdate(locationId, location, (err, locationUpdated) => {
                        if (err) {
                            fileController.writeLog(req, res, next, 500, err);
                            return res.status(500).send(constants.ERR_SERVER);
                        } else {
                            getLocation(req, res, next, locationUpdated._id);
                        }
                    });
                } else {
                    let message = 'La ubicacion \"' + location.description + '\" ya existe para ese depósito';
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

function deleteLocation(req, res, next) {

    initConnectionDB(req.session.database);

    let locationId = req.query.id;

    let user = new User();
    user._id = req.session.user;

    Location.findByIdAndUpdate(locationId,
        {
            $set: {
                updateUser: user,
                updateDate: moment().format('YYYY-MM-DDTHH:mm:ssZ'),
                operationType: 'D'
            }
        }, (err, locationUpdated) => {
            if (err) {
                fileController.writeLog(req, res, next, 500, err);
                return res.status(500).send(constants.ERR_SERVER);
            } else {
                fileController.writeLog(req, res, next, 200, "Ubicacion " + locationUpdated);
                return res.status(200).send({ location: locationUpdated });
            }
        });
}

function initConnectionDB(database) {

    const Model = require('./../models/model');

    let LocationScheme = require('./../models/location');
    Location = new Model('location', {
        schema: LocationScheme,
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
}

module.exports = {
    getLocation,
    getLocations,
    getLocationsV2,
    saveLocation,
    updateLocation,
    deleteLocation
}