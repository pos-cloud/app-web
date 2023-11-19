'use strict'

let fileController = require('./file.controller');
let constants = require('./../utilities/constants');
const { EJSON } = require('bson');
let moment = require('moment');
moment.locale('es');

let CompanyGroup;
let User;

function getCompanyGroup(req, res, next, id = undefined) {

	initConnectionDB(req.session.database);

	let companyGroupId;
	if (id) {
		companyGroupId = id;
	} else {
		companyGroupId = req.query.id;
	}

	CompanyGroup.findById(companyGroupId, (err, companyGroup) => {
		if (err) {
			fileController.writeLog(req, res, next, 500, err);
			return res.status(500).send(constants.ERR_SERVER);
		} else {
			User.populate(companyGroup, { path: 'creationUser' }, (err, companyGroup) => {
				if (err) {
					fileController.writeLog(req, res, next, 500, err);
					return res.status(500).send(constants.ERR_SERVER);
				} else {
					User.populate(companyGroup, { path: 'updateUser' }, (err, companyGroup) => {
						if (err) {
							fileController.writeLog(req, res, next, 500, err);
							return res.status(500).send(constants.ERR_SERVER);
						} else {
							if (!companyGroup || companyGroup.operationType == 'D') {
								fileController.writeLog(req, res, next, 404, constants.NO_DATA_FOUND);
								return res.status(404).send(constants.NO_DATA_FOUND);
							} else {
								fileController.writeLog(req, res, next, 200, companyGroup);
								return res.status(200).send({ companyGroup: companyGroup });
							}
						}
					});
				}
			});
		}
	});
}

function getCompaniesGroups(req, res, next) {


	initConnectionDB(req.session.database);

	//http://localhost:3000/api/rooms/limit=6&skip=0&select=description,code&sort="code":1&where="description":"s"

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

	CompanyGroup.find(where).
		limit(limit).
		select(select).
		sort(sort).
		skip(skip).
		exec((err, companiesGroups) => {
			if (err) {
				fileController.writeLog(req, res, next, 500, err);
				return res.status(500).send(constants.ERR_SERVER);
			} else {
				User.populate(companiesGroups, { path: 'creationUser' }, (err, companiesGroups) => {
					if (err) {
						fileController.writeLog(req, res, next, 500, err);
						return res.status(500).send(constants.ERR_SERVER);
					} else {
						User.populate(companiesGroups, { path: 'updateUser' }, (err, companiesGroups) => {
							if (err) {
								fileController.writeLog(req, res, next, 500, err);
								return res.status(500).send(constants.ERR_SERVER);
							} else {
								if (!companiesGroups) {
									fileController.writeLog(req, res, next, 404, constants.NO_DATA_FOUND);
									return res.status(404).send(constants.NO_DATA_FOUND);
								} else if (companiesGroups.length === 0) {
									fileController.writeLog(req, res, next, 200, constants.NO_DATA_FOUND);
									return res.status(200).send({ message: constants.NO_DATA_FOUND });
								} else {
									fileController.writeLog(req, res, next, 200, companiesGroups.length);
									return res.status(200).send({ companiesGroups: companiesGroups });
								}
							}
						});
					}
				});
			}
		});
}

function getCompaniesGroupsV2(req, res, next) {

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
						if (searchPropertyOfArray(JSON.parse(group), 'companiesGroups')) {
							projectGroup = `{ "companiesGroups": { "$slice": ["$companiesGroups", ${skip}, ${limit}] }`;
						} else {
							projectGroup = `{ "items": { "$slice": ["$items", ${skip}, ${limit}] }`;
						}
						for (let prop of Object.keys(JSON.parse(group))) {
							if (prop !== 'companiesGroups' && prop !== 'items') {
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

	CompanyGroup.aggregate(queryAggregate)
		.then(function (result) {
			fileController.writeLog(req, res, next, 200, result.length);
			if (result.length > 0) {
				if (group && group !== "{}" && group !== {}) {
					return res.status(200).send(result);
				} else {
					return res.status(200).send({ companiesGroups: result });
				}
			} else {
				if (group && group !== "{}" && group !== {}) {
					return res.status(200).send({ count: 0, companiesGroups: [] });
				} else {
					return res.status(200).send({ companiesGroups: [] });
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

function saveCompanyGroup(req, res, next) {

	initConnectionDB(req.session.database);

	let companyGroup = new CompanyGroup();
	let params = req.body;

	companyGroup.description = params.description;

	let user = new User();
	user._id = req.session.user;
	companyGroup.creationUser = user;
	companyGroup.creationDate = moment().format('YYYY-MM-DDTHH:mm:ssZ');
	companyGroup.operationType = 'C';

	if (companyGroup.description) {

		let json = '{"$and":[{"operationType": {"$ne": "D"}},';
		json = json + '{"description": "' + companyGroup.description + '"}]}';
		let where;
		try {
			where = JSON.parse(json);
		} catch (err) {
			fileController.writeLog(req, res, next, 500, json);
			fileController.writeLog(req, res, next, 500, err);
			return res.status(500).send(constants.ERR_SERVER);
		}

		CompanyGroup.find(where).exec((err, companiesGroups) => {
			if (err) {
				fileController.writeLog(req, res, next, 500, err);
				return res.status(500).send(constants.ERR_SERVER);
			} else {
				if (!companiesGroups || companiesGroups.length === 0) {
					companyGroup.save((err, companiesGroupsaved) => {
						if (err) {
							fileController.writeLog(req, res, next, 500, err);
							return res.status(500).send(constants.ERR_SERVER);
						} else {
							getCompanyGroup(req, res, next, companiesGroupsaved._id);
						}
					});
				} else {
					let message = 'El grupo \"' + companyGroup.description + '\" ya existe';
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

function updateCompanyGroup(req, res, next) {

	initConnectionDB(req.session.database);

	let companyGroupId = req.query.id;
	let companyGroup = req.body;

	let user = new User();
	user._id = req.session.user;
	companyGroup.updateUser = user;
	companyGroup.updateDate = moment().format('YYYY-MM-DDTHH:mm:ssZ');
	companyGroup.operationType = 'U';

	if (companyGroup.description) {

		let json = '{"$and":[{"operationType": {"$ne": "D"}},';
		json = json + '{"description": "' + companyGroup.description + '"},';
		json = json + '{"_id": {"$ne": "' + companyGroupId + '"}}]}';
		let where;
		try {
			where = JSON.parse(json);
		} catch (err) {
			fileController.writeLog(req, res, next, 500, json);
			fileController.writeLog(req, res, next, 500, err);
			return res.status(500).send(constants.ERR_SERVER);
		}

		CompanyGroup.find(where).exec((err, companiesGroups) => {
			if (err) {
				fileController.writeLog(req, res, next, 500, err);
				return res.status(500).send(constants.ERR_SERVER);
			} else {
				if (!companiesGroups || companiesGroups.length === 0) {
					CompanyGroup.findByIdAndUpdate(companyGroupId, companyGroup, (err, companyGroupUpdated) => {
						if (err) {
							fileController.writeLog(req, res, next, 500, err);
							return res.status(500).send(constants.ERR_SERVER);
						} else {
							getCompanyGroup(req, res, next, companyGroupUpdated._id);
						}
					});
				} else {
					let message = 'El grupo \"' + companyGroup.description + '\" ya existe';
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

function deleteCompanyGroup(req, res, next) {

	initConnectionDB(req.session.database);

	let companyGroupId = req.query.id;

	let user = new User();
	user._id = req.session.user;

	CompanyGroup.findByIdAndUpdate(companyGroupId,
		{
			$set: {
				updateUser: user,
				updateDate: moment().format('YYYY-MM-DDTHH:mm:ssZ'),
				operationType: 'D'
			}
		}, (err, companyGroupUpdated) => {
			if (err) {
				fileController.writeLog(req, res, next, 500, err);
				return res.status(500).send(constants.ERR_SERVER);
			} else {
				fileController.writeLog(req, res, next, 200, companyGroupUpdated._id);
				return res.status(200).send({ companyGroup: companyGroupUpdated })
			}
		});
}

function initConnectionDB(database) {
	let companiesGroupschema = require('./../models/company-group');
	const Model = require('./../models/model');
	CompanyGroup = new Model('company-group', {
		schema: companiesGroupschema,
		connection: database
	});

	let UserSchema = require('./../models/user');
	User = new Model('user', {
		schema: UserSchema,
		connection: database
	});
}

module.exports = {
	getCompanyGroup,
	getCompaniesGroups,
	getCompaniesGroupsV2,
	saveCompanyGroup,
	updateCompanyGroup,
	deleteCompanyGroup
}