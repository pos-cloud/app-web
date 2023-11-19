'use strict'

let fileController = require('./file.controller');
let constants = require('./../utilities/constants');
const { EJSON } = require('bson');
let moment = require('moment');
moment.locale('es');

let User;
let CompanyNews;
let Company;

function getCompanyNews(req, res, next, id = undefined) {

	initConnectionDB(req.session.database);

	let companyNewsId;
	if (id) {
		companyNewsId = id;
	} else {
		companyNewsId = req.query.id;
	}

	CompanyNews.findById(companyNewsId, (err, companyNews) => {
		if (err) {
			fileController.writeLog(req, res, next, 500, err);
			return res.status(500).send(constants.ERR_SERVER);
		} else {
			if (!companyNews || companyNews.operationType == 'D') {
				fileController.writeLog(req, res, next, 404, constants.NO_DATA_FOUND);
				return res.status(404).send(constants.NO_DATA_FOUND);
			} else {
				Company.populate(companyNews, { path: 'company' }, (err, companyNews) => {
					if (err) {
						fileController.writeLog(req, res, next, 500, err);
						return res.status(500).send(constants.ERR_SERVER);
					} else {
						fileController.writeLog(req, res, next, 200, companyNews);
						return res.status(200).send({ companyNews: companyNews });
					}
				});
			}
		}
	});
}

function getCompaniesNews(req, res, next) {

	//http://localhost:3000/api/companyNews/limit=6&skip=0&select=news,code&sort="code":1&where="news":"s"

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

	CompanyNews.find(where).
		limit(limit).
		select(select).
		sort(sort).
		skip(skip).
		exec((err, companiesNews) => {
			if (err) {
				fileController.writeLog(req, res, next, 500, err);
				return res.status(500).send(constants.ERR_SERVER);
			} else {
				if (!companiesNews) {
					fileController.writeLog(req, res, next, 404, constants.NO_DATA_FOUND);
					return res.status(404).send(constants.NO_DATA_FOUND);
				} else if (companiesNews.length === 0) {
					fileController.writeLog(req, res, next, 200, constants.NO_DATA_FOUND);
					return res.status(200).send({ message: constants.NO_DATA_FOUND });
				} else {
					Company.populate(companiesNews, { path: 'company' }, (err, companiesNews) => {
						if (err) {
							fileController.writeLog(req, res, next, 500, err);
							return res.status(500).send(constants.ERR_SERVER);
						} else {
							fileController.writeLog(req, res, next, 200, 'CompanyNews ' + companiesNews.length);
							return res.status(200).send({ companiesNews: companiesNews });
						}
					});;
				}
			}
		});
}

function getCompaniesNewsV2(req, res, next) {

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
						if (searchPropertyOfArray(JSON.parse(group), 'companiesNews')) {
							projectGroup = `{ "companiesNews": { "$slice": ["$companiesNews", ${skip}, ${limit}] }`;
						} else {
							projectGroup = `{ "items": { "$slice": ["$items", ${skip}, ${limit}] }`;
						}
						for (let prop of Object.keys(JSON.parse(group))) {
							if (prop !== 'companiesNews' && prop !== 'items') {
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

	CompanyNews.aggregate(queryAggregate)
		.then(function (result) {
			fileController.writeLog(req, res, next, 200, result.length);
			if (result.length > 0) {
				if (group && group !== "{}" && group !== {}) {
					return res.status(200).send(result);
				} else {
					return res.status(200).send({ companiesNews: result });
				}
			} else {
				if (group && group !== "{}" && group !== {}) {
					return res.status(200).send({ count: 0, companiesNews: [] });
				} else {
					return res.status(200).send({ companiesNews: [] });
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

function saveCompanyNews(req, res, next) {

	initConnectionDB(req.session.database);

	let companyNews = new CompanyNews();
	let params = req.body;

	companyNews.date = params.date;
	companyNews.news = params.news;
	companyNews.state = params.state;
	companyNews.company = params.company;

	let user = new User();
	user._id = req.session.user;
	companyNews.creationUser = user;
	companyNews.creationDate = moment().format('YYYY-MM-DDTHH:mm:ssZ');
	companyNews.operationType = 'C';

	if (companyNews.news) {
		companyNews.save((err, companyNewsSaved) => {
			if (err) {
				fileController.writeLog(req, res, next, 500, err);
				return res.status(500).send(constants.ERR_SERVER);
			} else {
				getCompanyNews(req, res, next, companyNewsSaved._id);
			}
		});
	} else {
		fileController.writeLog(req, res, next, 200, constants.COMPLETE_ALL_THE_DATA);
		return res.status(200).send({ message: constants.COMPLETE_ALL_THE_DATA });
	}
}

function updateCompanyNews(req, res, next) {

	initConnectionDB(req.session.database);

	let companyNewsId = req.query.id;
	let companyNews = req.body;

	let user = new User();
	user._id = req.session.user;
	companyNews.updateUser = user;
	companyNews.operationType = 'U';

	if (companyNews.news) {
		CompanyNews.findByIdAndUpdate(companyNewsId, companyNews, (err, companyNewsUpdated) => {
			if (err) {
				fileController.writeLog(req, res, next, 500, err);
				return res.status(500).send(constants.ERR_SERVER);
			} else {
				getCompanyNews(req, res, next, companyNewsUpdated._id);
			}
		});
	} else {
		fileController.writeLog(req, res, next, 200, constants.COMPLETE_ALL_THE_DATA);
		return res.status(200).send({ message: constants.COMPLETE_ALL_THE_DATA });
	}
}

function deleteCompanyNews(req, res, next) {

	initConnectionDB(req.session.database);

	let companyNewsId = req.query.id;

	let user = new User();
	user._id = req.session.user;

	CompanyNews.findByIdAndUpdate(companyNewsId,
		{
			updateUser: user,
			updateDate: moment().format('YYYY-MM-DDTHH:mm:ssZ'),
			operationType: 'D'
		}, (err, companyNewsUpdated) => {
			if (err) {
				fileController.writeLog(req, res, next, 500, err);
				return res.status(500).send(constants.ERR_SERVER);
			} else {
				fileController.writeLog(req, res, next, 200, "CompanyNews " + companyNewsUpdated);
				return res.status(200).send({ companyNews: companyNewsUpdated });
			}
		});
}

function initConnectionDB(database) {

	const Model = require('./../models/model');

	let CompanyNewsSchema = require('./../models/company-news');
	CompanyNews = new Model('company-news', {
		schema: CompanyNewsSchema,
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
	getCompanyNews,
	getCompaniesNews,
	getCompaniesNewsV2,
	saveCompanyNews,
	updateCompanyNews,
	deleteCompanyNews
}