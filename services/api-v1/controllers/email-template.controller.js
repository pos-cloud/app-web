'use strict'

let fileController = require('./file.controller');
let constants = require('./../utilities/constants');
const { EJSON } = require('bson');
let moment = require('moment');
moment.locale('es');

let User;
let EmailTemplate;


function getEmailTemplates(req, res, next) {

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
						if (searchPropertyOfArray(JSON.parse(group), 'emailTemplates')) {
							projectGroup = `{ "emailTemplates": { "$slice": ["$emailTemplates", ${skip}, ${limit}] }`;
						} else {
							projectGroup = `{ "items": { "$slice": ["$items", ${skip}, ${limit}] }`;
						}
						for (let prop of Object.keys(JSON.parse(group))) {
							if (prop !== 'emailTemplates' && prop !== 'items') {
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

	EmailTemplate.aggregate(queryAggregate)
		.then(function (result) {
			fileController.writeLog(req, res, next, 200, result.length);
			if (result.length > 0) {
				if (group && group !== "{}" && group !== {}) {
					return res.status(200).send(result);
				} else {
					return res.status(200).send({ emailTemplates: result });
				}
			} else {
				if (group && group !== "{}" && group !== {}) {
					return res.status(200).send({ count: 0, emailTemplates: [] });
				} else {
					return res.status(200).send({ emailTemplates: [] });
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

function saveEmailTemplate(req, res, next) {

	initConnectionDB(req.session.database);

	let emailTemplate = new EmailTemplate();
	let params = req.body;

	emailTemplate.name = params.name;
	emailTemplate.design = params.design;

	let user = new User();
    user._id = req.session.user;
    emailTemplate.creationDate = moment().format('YYYY-MM-DDTHH:mm:ssZ');
	emailTemplate.creationUser = user;
	emailTemplate.operationType = 'C';


	if (emailTemplate.name) {


		let json = '{"$and":[{"operationType": {"$ne": "D"}},';
		json = json + '{"name": "' + emailTemplate.name + '"}]}';


		let where;
		try {
			where = JSON.parse(json);
		} catch (err) {
			fileController.writeLog(req, res, next, 500, json);
			fileController.writeLog(req, res, next, 500, err);
			return res.status(500).send(constants.ERR_SERVER);
		}

		EmailTemplate.find(where).exec((err, emailTemplates) => {
			if (err) {
				fileController.writeLog(req, res, next, 500, err);
				return res.status(500).send(constants.ERR_SERVER);
			} else {
				if (!emailTemplates || emailTemplates.length === 0) {
					emailTemplate.save((err, emailTemplateSave) => {
						if (err) {
							fileController.writeLog(req, res, next, 500, err);
							return res.status(500).send(constants.ERR_SERVER);
						} else {
                            return res.status(200).send({ message: "Se guardo con éxito." });
						}
					});
				} else {
					let message = 'El diseño \"' + emailTemplate.name + '\" ya existe ';
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

function updateEmailTemplate(req, res, next) {

	initConnectionDB(req.session.database);

	let emailTemplateId = req.query.id;
	let emailTemplate = req.body;

	let user = new User();
    user._id = req.session.user;
    emailTemplate.updateDate = moment().format('YYYY-MM-DDTHH:mm:ssZ');
	emailTemplate.updateUser = user;
	emailTemplate.operationType = 'U';

	if (emailTemplate.name ) {

		let json = '{"$and":[{"operationType": {"$ne": "D"}},';
		json = json + '{"_id": {"$ne": "' + emailTemplateId + '"}},';
		json = json + '{"name": "' + emailTemplate.name + '"}]}';

		let where;
		try {
			where = JSON.parse(json);
		} catch (err) {
			fileController.writeLog(req, res, next, 500, json);
			fileController.writeLog(req, res, next, 500, err);
			return res.status(500).send(constants.ERR_SERVER);
		}

		EmailTemplate.find(where).exec((err, emailTemplates) => {
			if (err) {
				fileController.writeLog(req, res, next, 500, err);
				return res.status(500).send(constants.ERR_SERVER);
			} else {
				if (!emailTemplates || emailTemplates.length === 0) {
					EmailTemplate.findByIdAndUpdate(emailTemplateId, emailTemplate, (err, emailTemplateUpdated) => {
						if (err) {
							fileController.writeLog(req, res, next, 500, err);
							return res.status(500).send(constants.ERR_SERVER);
						} else {
                            return res.status(200).send({ message: "Se actualizo con exito" });
						}
					});
				} else {
					let message = 'El diseño \"' + emailTemplate.name + '\" ya existe';
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

function deleteEmailTemplate(req, res, next) {

	initConnectionDB(req.session.database);

	let emailTemplateId = req.query.id;

	let user = new User();
	user._id = req.session.user;

	EmailTemplate.findByIdAndUpdate(emailTemplateId,
		{
			$set: {
				updateUser: user,
				updateDate: moment().format('YYYY-MM-DDTHH:mm:ssZ'),
				operationType: 'D'
			}
		}, (err, emailTemplateUpdated) => {
			if (err) {
				fileController.writeLog(req, res, next, 500, err);
				return res.status(500).send(constants.ERR_SERVER);
			} else {
				fileController.writeLog(req, res, next, 200, "EmailTemplateo " + emailTemplateUpdated);
				return res.status(200).send({ emailTemplate: emailTemplateUpdated });
			}
		});
}

function initConnectionDB(database) {

	const Model = require('./../models/model');

	let EmailTemplateSchema = require('./../models/email-template');
	EmailTemplate = new Model('email-template', {
		schema: EmailTemplateSchema,
		connection: database
	});

	let UserSchema = require('./../models/user');
	User = new Model('user', {
		schema: UserSchema,
		connection: database
	});
}

module.exports = {
	getEmailTemplates,
	saveEmailTemplate,
	updateEmailTemplate,
	deleteEmailTemplate
}