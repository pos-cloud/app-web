'use strict'

let fileController = require('./file.controller');
let constants = require('../utilities/constants');
const { EJSON } = require('bson');

let Application;
let User;

function getApplication(req, res, next, id = undefined) {

	initConnectionDB(req.session.database);

    let applicationId;
    if(id) {
        applicationId = id;
    } else {
        applicationId = req.query.id;
    }

    Application.findById(applicationId, (err, application) => {
        if (err) {
            fileController.writeLog(req, res, next, 500, err);
            return res.status(500).send(err);
        } else {
            if (!application || application.operationType == 'D') {
                fileController.writeLog(req, res, next, 404, constants.NO_DATA_FOUND);
                return res.status(404).send(constants.NO_DATA_FOUND);
            } else if (application === undefined) {
                fileController.writeLog(req, res, next, 200, constants.NO_DATA_FOUND);
                return res.status(200).send({ message: constants.NO_DATA_FOUND });
            } else {
                fileController.writeLog(req, res, next, 200, application);
                return res.status(200).send({ application: application });
            }
        }
    });
}

function getApplications(req, res, next) {

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
						if (searchPropertyOfArray(JSON.parse(group), 'applications')) {
							projectGroup = `{ "applications": { "$slice": ["$applications", ${skip}, ${limit}] }`;
						} else {
							projectGroup = `{ "items": { "$slice": ["$items", ${skip}, ${limit}] }`;
						}
						for (let prop of Object.keys(JSON.parse(group))) {
							if (prop !== 'applications' && prop !== 'items') {
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

	Application.aggregate(queryAggregate)
		.then(function (result) {
			fileController.writeLog(req, res, next, 200, result.length);
			if (result.length > 0) {
				if (group && group !== "{}" && group !== {}) {
					return res.status(200).send(result);
				} else {
					return res.status(200).send({ applications: result });
				}
			} else {
				if (group && group !== "{}" && group !== {}) {
					return res.status(200).send({ count: 0, applications: [] });
				} else {
					return res.status(200).send({ applications: [] });
				}
			}
		}).catch(err => {
			fileController.writeLog(req, res, next, 500, err);
			return res.status(500).send(err);
		});
}

function searchPropertyOfArray(array, value) {
    let n = false;
    for(let a of Object.keys(array)) { if(!n) n = a.includes(value);}
    return n;
}

function saveApplication(req, res, next) {
    
	initConnectionDB(req.session.database);

    let application = new Application();
    let params = req.body;

    application.order = params.order;
    application.name = params.name;
    application.url = params.url;
    application.type = params.type;
    application.allowArticle = params.allowArticle;
   
    let user = new User();
    user._id = req.session.user;
    application.creationUser = user;
    application.creationDate = new Date();
    application.operationType = 'C';

    application.save((err, applicationSave) => {
        if (err) {
            fileController.writeLog(req, res, next, 500, err);
            return res.status(500).send(err);
        } else {
            fileController.writeLog(req, res, next, 200, applicationSave._id);
            getApplication(req, res, next, applicationSave._id);
        }
    })
}

function updateApplication(req, res, next) {

	initConnectionDB(req.session.database);

    let applicationId = req.query.id;
    let application = req.body;

    let user = new User();
	user._id = req.session.user;
    application.updateDate = new Date();
    application.operationType = 'U';

    Application.findByIdAndUpdate(applicationId,application, (err, applicationUpdated) => {
        if (err) {
            fileController.writeLog(req, res, next, 500, err);
            return res.status(500).send(err);
        } else {
            fileController.writeLog(req, res, next, 200, applicationUpdated._id);
            getApplication(req, res, next, applicationUpdated._id);
        }
    })
            
}

async function deleteApplication(req, res, next) {

	initConnectionDB();

	let applicationId = req.query.id;

	Application.deleteOne({ _id: applicationId }, (err, result) => {
		if (err) {
			fileController.writeLog(req, res, next, 500, err);
			return res.status(500).send(err);
		} else {
			fileController.writeLog(req, res, next, 200, result);
			return res.status(200).send(result);
		}
	});
}

function initConnectionDB(database) {

    const Model = require('../models/model');

    let ApplicationSchema = require('../models/application');
    Application = new Model('application', {
        schema: ApplicationSchema,
        connection: database
    });

    let UserSchema = require('../models/user');
    User = new Model('user', {
        schema: UserSchema,
        connection: database
    });

}

module.exports = {
    getApplication,
    getApplications,
    saveApplication,
    updateApplication,
    deleteApplication
}