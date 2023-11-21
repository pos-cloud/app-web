'use strict'

let fileController = require('./file.controller');
let constants = require('./../utilities/constants');
const { EJSON } = require('bson');
let moment = require('moment');
moment.locale('es');

let User;
let CompanyContact;
let Company;

function getCompanyContact(req, res, next, id = undefined) {

	initConnectionDB(req.session.database);

	let companyContactId;
	if (id) {
		companyContactId = id;
	} else {
		companyContactId = req.query.id;
	}

	CompanyContact.findById(companyContactId, (err, companyContact) => {
		if (err) {
			fileController.writeLog(req, res, next, 500, err);
			return res.status(500).send(constants.ERR_SERVER);
		} else {
			if (!companyContact || companyContact.operationType == 'D') {
				fileController.writeLog(req, res, next, 404, constants.NO_DATA_FOUND);
				return res.status(404).send(constants.NO_DATA_FOUND);
			} else {
				Company.populate(companyContact, { path: 'company' }, (err, companyContact) => {
					if (err) {
						fileController.writeLog(req, res, next, 500, err);
						return res.status(500).send(constants.ERR_SERVER);
					} else {
						fileController.writeLog(req, res, next, 200, companyContact);
						return res.status(200).send({ companyContact: companyContact });
					}
				});
			}
		}
	});
}

function getCompaniesContacts(req, res, next) {

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

	CompanyContact.find(where).
		limit(limit).
		select(select).
		sort(sort).
		skip(skip).
		exec((err, companiesContacts) => {
			if (err) {
				fileController.writeLog(req, res, next, 500, err);
				return res.status(500).send(constants.ERR_SERVER);
			} else {
				if (!companiesContacts) {
					fileController.writeLog(req, res, next, 404, constants.NO_DATA_FOUND);
					return res.status(404).send(constants.NO_DATA_FOUND);
				} else if (companiesContacts.length === 0) {
					fileController.writeLog(req, res, next, 200, constants.NO_DATA_FOUND);
					return res.status(200).send({ message: constants.NO_DATA_FOUND });
				} else {
					Company.populate(companiesContacts, { path: 'company' }, (err, companiesContacts) => {
						if (err) {
							fileController.writeLog(req, res, next, 500, err);
							return res.status(500).send(constants.ERR_SERVER);
						} else {
							if (companiesContacts) {
								fileController.writeLog(req, res, next, 200, 'CompanyContact ' + companiesContacts.length);
							}
							return res.status(200).send({ companiesContacts: companiesContacts });
						}
					});;
				}
			}
		});
}

function getCompaniesContactsV2(req, res, next) {

	initConnectionDB(req.session.database);

	let queryAggregate = [];
	let group;

	if (req.query && req.query !== {}) {

		let error;

		let project = req.query.project;
		if (project && project !== {} && project !== "{}") {
			try {
				project = JSON.parse(project);

				if (searchPropertyOfArray(project, 'company.')) {
					queryAggregate.push({ $lookup: { from: "companies", foreignField: "_id", localField: "company", as: "company" } });
					queryAggregate.push({ $unwind: { path: "$company", preserveNullAndEmptyArrays: true } });
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
						if (searchPropertyOfArray(JSON.parse(group), 'companiesContacts')) {
							projectGroup = `{ "companiesContacts": { "$slice": ["$companiesContacts", ${skip}, ${limit}] }`;
						} else {
							projectGroup = `{ "items": { "$slice": ["$items", ${skip}, ${limit}] }`;
						}
						for (let prop of Object.keys(JSON.parse(group))) {
							if (prop !== 'companiesContacts' && prop !== 'items') {
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

	CompanyContact.aggregate(queryAggregate)
		.then(function (result) {
			fileController.writeLog(req, res, next, 200, result.length);
			if (result.length > 0) {
				if (group && group !== "{}" && group !== {}) {
					return res.status(200).send(result);
				} else {
					return res.status(200).send({ companiesContacts: result });
				}
			} else {
				if (group && group !== "{}" && group !== {}) {
					return res.status(200).send({ count: 0, companiesContacts: [] });
				} else {
					return res.status(200).send({ companiesContacts: [] });
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

function saveCompanyContact(req, res, next) {

	initConnectionDB(req.session.database);

	let companyContact = new CompanyContact();
	let params = req.body;

	companyContact.name = params.name;
	companyContact.phone = params.phone;
	companyContact.position = params.position;

	companyContact.company = params.company;

	let user = new User();
	user._id = req.session.user;
	companyContact.creationUser = user;
	companyContact.creationDate = moment().format('YYYY-MM-DDTHH:mm:ssZ');
	companyContact.operationType = 'C';

	if (companyContact.name) {
		companyContact.save((err, companyContactSaved) => {
			if (err) {
				fileController.writeLog(req, res, next, 500, err);
				return res.status(500).send(constants.ERR_SERVER);
			} else {
				getCompanyContact(req, res, next, companyContactSaved._id);
			}
		});
	} else {
		fileController.writeLog(req, res, next, 200, constants.COMPLETE_ALL_THE_DATA);
		return res.status(200).send({ message: constants.COMPLETE_ALL_THE_DATA });
	}
}

function updateCompanyContact(req, res, next) {

	initConnectionDB(req.session.database);

	let companyContactId = req.query.id;
	let companyContact = req.body;

	let user = new User();
	user._id = req.session.user;
	companyContact.updateUser = user;
	companyContact.operationType = 'U';

	if (companyContact.name) {
		CompanyContact.findByIdAndUpdate(companyContactId, companyContact, (err, companyContactUpdated) => {
			if (err) {
				fileController.writeLog(req, res, next, 500, err);
				return res.status(500).send(constants.ERR_SERVER);
			} else {
				getCompanyContact(req, res, next, companyContactUpdated._id);
			}
		});
	} else {
		fileController.writeLog(req, res, next, 200, constants.COMPLETE_ALL_THE_DATA);
		return res.status(200).send({ message: constants.COMPLETE_ALL_THE_DATA });
	}
}

function deleteCompanyContact(req, res, next) {

	initConnectionDB(req.session.database);

	let companyContactId = req.query.id;

	let user = new User();
	user._id = req.session.user;

	CompanyContact.findByIdAndUpdate(companyContactId,
		{
			$set: {
				updateUser: user,
				updateDate: moment().format('YYYY-MM-DDTHH:mm:ssZ'),
				operationType: 'D'
			}
		}, (err, companyContactUpdated) => {
			if (err) {
				fileController.writeLog(req, res, next, 500, err);
				return res.status(500).send(constants.ERR_SERVER);
			} else {
				fileController.writeLog(req, res, next, 200, "CompanyContact " + companyContactUpdated);
				return res.status(200).send({ companyContact: companyContactUpdated });
			}
		});
}

function initConnectionDB(database) {

	const Model = require('./../models/model');

	let CompanyContactSchema = require('./../models/company-contact');
	CompanyContact = new Model('company-contact', {
		schema: CompanyContactSchema,
		connection: database
	});

	let CompanySchema = require('./../models/company');
	Company = new Model('company', {
		schema: CompanySchema,
		connection: database
	});

	let UserSchema = require('./../models/user');
	User = new Model('user', {
		schema: UserSchema,
		connection: database
	});
}

module.exports = {
	getCompanyContact,
	getCompaniesContacts,
	getCompaniesContactsV2,
	saveCompanyContact,
	updateCompanyContact,
	deleteCompanyContact
}