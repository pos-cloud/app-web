'use strict'

let fs = require('fs');
let fileController = require('./file.controller');
let constants = require('./../utilities/constants');
let path = require('path');
const { EJSON } = require('bson');
let moment = require('moment');
moment.locale('es');

let Config;
let User;
let VatCondition;
let IdentificationType;
let Currency;
let Account
let Company

function getConfig(req, res, next) {

	initConnectionDB(req.session.database);

	Config.find()
		.populate({
			path: 'companyVatCondition',
			model: VatCondition
		})
		.populate({
			path: 'companyIdentificationType',
			model: IdentificationType
		})
		.populate({
			path: 'article.salesAccount.default',
			model: Account
		})
		.populate({
			path: 'article.purchaseAccount.default',
			model: Account
		})
		.populate({
			path: 'company.accountClient.default',
			model: Account
		})
		.populate({
			path: 'company.accountProvider.default',
			model: Account
		})
		.populate({
			path: 'currency',
			model: Currency
		})
		.populate({
			path: 'company.vatCondition.default',
			model: VatCondition
		})
		.exec((err, configs) => {
			if (err) {
				fileController.writeLog(req, res, next, 500, err);
				return res.status(500).send(constants.ERR_SERVER);
			} else {
				if (!configs) {
					fileController.writeLog(req, res, next, 404, constants.NO_DATA_FOUND);
					return res.status(404).send(constants.NO_DATA_FOUND);
				} else if (configs.length === 0) {
					fileController.writeLog(req, res, next, 200, constants.NO_DATA_FOUND);
					return res.status(200).send({ message: constants.NO_DATA_FOUND });
				} else {
					fileController.writeLog(req, res, next, 200, configs.length);
					return res.status(200).send({ configs: configs });
				}
			}
		});
}

function getConfigAsync(req, res, next) {

	return new Promise((resolve, reject) => {

		initConnectionDB(req.session.database);

		Config.find()
			.populate({
				path: 'companyVatCondition',
				model: VatCondition
			})
			.populate({
				path: 'companyIdentificationType',
				model: IdentificationType
			})
			.populate({
				path: 'article.salesAccount.default',
				model: Account
			})
			.populate({
				path: 'article.purchaseAccount.default',
				model: Account
			})
			.populate({
				path: 'company.accountClient.default',
				model: Account
			})
			.populate({
				path: 'company.accountProvider.default',
				model: Account
			})
			.populate({
				path: 'currency',
				model: Currency
			})
			.populate({
				path: 'company.vatCondition.default',
				model: VatCondition
			})
			.exec((err, configs) => {
				if (err) {
					reject(err);
				} else {
					resolve(configs);
				}
			});
	});
}

function getConfigs(req, res, next) {

	initConnectionDB(req.session.database);

	let queryAggregate = [];
	let group;

	if (req.query && req.query !== {}) {

		let error;

		let project = req.query.project;
		if (project && project !== {} && project !== "{}") {
			try {
				project = JSON.parse(project);

				if (searchPropertyOfArray(project, 'companyIdentificationType.')) {
					queryAggregate.push({ $lookup: { from: "identification-types", foreignField: "_id", localField: "companyIdentificationType", as: "companyIdentificationType" } });
					queryAggregate.push({ $unwind: { path: "$companyIdentificationType", preserveNullAndEmptyArrays: true } });
				}

				if (searchPropertyOfArray(project, 'companyVatCondition.')) {
					queryAggregate.push({ $lookup: { from: "vat-conditions", foreignField: "_id", localField: "companyVatCondition", as: "companyVatCondition" } });
					queryAggregate.push({ $unwind: { path: "$companyVatCondition", preserveNullAndEmptyArrays: true } });
				}

				if (searchPropertyOfArray(project, 'currency.')) {
					queryAggregate.push({ $lookup: { from: "currencies", foreignField: "_id", localField: "currency", as: "currency" } });
					queryAggregate.push({ $unwind: { path: "$currency", preserveNullAndEmptyArrays: true } });
				}

				if (searchPropertyOfArray(project, 'article.salesAccount.default')) {
					queryAggregate.push({ $lookup: { from: "accounts", foreignField: "_id", localField: "article.salesAccount.default", as: "article.salesAccount.default" } });
					queryAggregate.push({ $unwind: { path: "$article.salesAccount.default", preserveNullAndEmptyArrays: true } });
				}

				if (searchPropertyOfArray(project, 'article.purchaseAccount.default')) {
					queryAggregate.push({ $lookup: { from: "accounts", foreignField: "_id", localField: "article.purchaseAccount.default", as: "article.salesAccount.default" } });
					queryAggregate.push({ $unwind: { path: "$article.purchaseAccount.default", preserveNullAndEmptyArrays: true } });
				}

				if (searchPropertyOfArray(project, 'company.accountClient.default')) {
					queryAggregate.push({ $lookup: { from: "accounts", foreignField: "_id", localField: "company.accountClient.default", as: "company.accountClient.default" } });
					queryAggregate.push({ $unwind: { path: "$company.accountClient.default", preserveNullAndEmptyArrays: true } });
				}

				if (searchPropertyOfArray(project, 'company.accountProvider.default')) {
					queryAggregate.push({ $lookup: { from: "accounts", foreignField: "_id", localField: "company.accountProvider.default", as: "company.accountProvider.default" } });
					queryAggregate.push({ $unwind: { path: "$company.accountProvider.default", preserveNullAndEmptyArrays: true } });
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
						if (searchPropertyOfArray(JSON.parse(group), 'configs')) {
							projectGroup = `{ "configs": { "$slice": ["$configs", ${skip}, ${limit}] }`;
						} else {
							projectGroup = `{ "items": { "$slice": ["$items", ${skip}, ${limit}] }`;
						}
						for (let prop of Object.keys(JSON.parse(group))) {
							if (prop !== 'configs' && prop !== 'items') {
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

	Config.aggregate(queryAggregate)
		.then(function (result) {
			fileController.writeLog(req, res, next, 200, result.length);
			if (result.length > 0) {
				if (group && group !== "{}" && group !== {}) {
					return res.status(200).send(result);
				} else {
					return res.status(200).send({ configs: result });
				}
			} else {
				if (group && group !== "{}" && group !== {}) {
					return res.status(200).send({ count: 0, configs: [] });
				} else {
					return res.status(200).send({ configs: [] });
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

function saveConfig(req, res, next) {

	initConnectionDB(req.session.database);

	let config = new Config();
	let params = req.body;

	config.companyPicture = params.companyPicture;
	config.numberCompany = params.numberCompany;
	config.licensePaymentDueDate = params.licensePaymentDueDate;
	config.expirationLicenseDate = params.expirationLicenseDate;
	config.apiHost = params.apiHost;
	config.apiPort = params.apiPort;
	config.footerInvoice = params.footerInvoice;
	config.companyFantasyName = params.companyFantasyName;
	config.country = params.country;
	config.timezone = params.timezone;
	config.currency = params.currency;
	config.showLicenseNotification = params.showLicenseNotification;
	config.companyPostalCode = params.companyPostalCode;
	config.article = params.article;
	config.company = params.company;
	config.reports = params.reports;
	config.tradeBalance = params.tradeBalance;
	config.voucher = params.voucher;
	config.cashBox = params.cashBox;
	config.latitude = params.latitude;
	config.longitude = params.longitude;
	config.twilio = params.twilio;

	let user = new User();
	user._id = req.session.user;
	config.creationUser = user;
	config.creationDate = moment().format('YYYY-MM-DDTHH:mm:ssZ');
	config.operationType = 'C';

	config.save((err, configSaved) => {
		if (err) {
			fileController.writeLog(req, res, next, 500, err);
			return res.status(500).send(constants.ERR_SERVER);
		} else {
			getConfig(req, res, next);
		}
	});
}

function updateConfig(req, res, next) {

	initConnectionDB(req.session.database);

	let configId = req.query.id;
	let config = req.body;

	if (req.session) {
		let user = new User();
		user._id = req.session.user;
		config.updateUser = user;
	}
	config.updateDate = moment().format('YYYY-MM-DDTHH:mm:ssZ');
	config.operationType = 'U';

	Config.findByIdAndUpdate(configId, config, async (err, configUpdated) => {
		if (err) {
			fileController.writeLog(req, res, next, 500, err);
			return res.status(500).send(constants.ERR_SERVER);
		} else {
			// let provaiderCurrent = config['company.allowCurrentAccountProvider.default']
			// let clientCurrent = config['company.allowCurrentAccountClient.default']

			// // ACTUALIZAR CLIENTE PARA CUENTA CORRIENTE TRUE
			// await Company.updateMany({type : 'Cliente'} , {$set : {allowCurrentAccount:clientCurrent} })
			// await Company.updateMany({type : 'Proveedor'} , {$set : {allowCurrentAccount:provaiderCurrent} })

			getConfig(req, res, next);
		}
	});
}

function getImage(req, res, next) {

	let picture = req.params.picture;

	if (picture && picture !== undefined) {
		try {
			return res.sendFile(path.resolve('/home/clients/' + req.params.database + '/images/company/' + picture));
		} catch (err) {
			fileController.writeLog(req, res, next, 404, constants.NO_IMAGEN_FOUND);
			return res.status(404).send(constants.NO_IMAGEN_FOUND);
		}
	}
}

function getImageBase64(req, res, next) {

	initConnectionDB(req.session.database);

	let fs = require('fs');
	let picture = req.query.picture;

	if (picture && picture !== undefined) {
		try {
			let bitmap = fs.readFileSync(path.resolve('/home/clients/' + req.session.database + '/images/company/' + picture));
			return res.status(200).send({ imageBase64: new Buffer(bitmap).toString('base64') });
		} catch (err) {
			fileController.writeLog(req, res, next, 404, constants.NO_IMAGEN_FOUND);
			return res.status(404).send(constants.NO_IMAGEN_FOUND);
		}
	}
}

function uploadImage(req, res, next) {

	initConnectionDB(req.session.database);

	let configId = req.params.id;

	if (req.file) {

		Config.find().exec((err, configs) => {
			if (err) {
				fileController.writeLog(req, res, next, 500, err);
				return res.status(500).send(constants.ERR_SERVER);
			} else {
				if (!configs) {
					fileController.writeLog(req, res, next, 404, constants.NO_DATA_FOUND);
					return res.status(404).send(constants.NO_DATA_FOUND);
				} else if (configs.length === 0) {
					fileController.writeLog(req, res, next, 200, constants.NO_DATA_FOUND);
					return res.status(200).send({ message: constants.NO_DATA_FOUND });
				} else {
					let imageToDelete = configs[0].companyPicture;
					Config.findByIdAndUpdate(configId, { companyPicture: req.params.id + '-' + req.file.originalname.normalize('NFD').replace(/[\u0300-\u036f]/g, "") }, (err, configUpdate) => {
						if (err) {
							fileController.writeLog(req, res, next, 500, err);
							return res.status(500).send(constants.ERR_SERVER);
						} else {
							getConfig(req, res, next);
						}
					});
				}
			}
		});
	} else {
		fileController.writeLog(req, res, next, 404, constants.NO_IMAGEN_FOUND);
		return res.status(404).send(constants.NO_IMAGEN_FOUND);
	}
}

function uploadCrt(req, res, next) {

	initConnectionDB(req.session.database);

	if (req.file) {

		fileController.writeLog(req, res, next, 200, "ok");
		return res.status(200).send({ result: "Certificado subido correctamente" });

	} else {
		fileController.writeLog(req, res, next, 404, constants.NO_IMAGEN_FOUND);
		return res.status(404).send(constants.NO_IMAGEN_FOUND);
	}
}

function deleteImage(req, res, next, picture = undefined) {

	if (!picture) {

		initConnectionDB(req.session.database);

		let configId = req.query.id;

		Config.findById(configId, (err, config) => {
			if (err) {
				fileController.writeLog(req, res, next, 500, err);
				return res.status(500).send(constants.ERR_SERVER);
			} else {
				if (!config || config.operationType == 'D') {
					fileController.writeLog(req, res, next, 200, constants.NO_DATA_FOUND);
					return res.status(200).send({ message: constants.NO_DATA_FOUND });
				} else {
					let imageToDelete = config.companyPicture;
					if (imageToDelete && imageToDelete != 'default.jpg') {
						Config.findByIdAndUpdate(configId, { companyPicture: 'default.jpg' }, (err, configUpdate) => {
							if (err) {
								fileController.writeLog(req, res, next, 500, err);
								return res.status(500).send(constants.ERR_SERVER);
							} else {
								try {
									fs.unlinkSync('/home/clients/' + req.session.database + '/images/company/' + imageToDelete);
								} catch (err) {
								}
								getConfig(req, res, next);
							}
						});
					}
				}
			}
		});
	} else {
		if (picture && picture != 'default.jpg') {
			try {
				fs.unlinkSync('/home/clients/' + req.session.database + 'images/company/' + picture);
			} catch (err) {
			}
		};
	}
}

function getModel(req, res, next) {

	let model = req.query.model

	let ObjectModelSchema = require('./../models/' + model);

	let modelFinal = [];

	for (let model in ObjectModelSchema.paths) {
		if (model !== 'useOfCFDI') {
			if (ObjectModelSchema.paths[model].instance == 'ObjectID') {
				if (ObjectModelSchema.paths[model].options.ref) {
					let rel = require('./../models/' + ObjectModelSchema.paths[model].options.ref);
					for (let sonField in rel.paths) {
						modelFinal.push(model + '.' + sonField)
					}
				}
			} else {
				modelFinal.push(model)
			}
		}
	}



	return res.status(200).send({ model: modelFinal });

}

function initConnectionDB(database) {

	let ConfigSchema = require('./../models/config');
	const Model = require('./../models/model');
	Config = new Model('config', {
		schema: ConfigSchema,
		connection: database
	});

	let VatConditionSchema = require('./../models/vat-condition');
	VatCondition = new Model('vat-condition', {
		schema: VatConditionSchema,
		connection: database
	});

	let IdentificationTypeSchema = require('./../models/identification-type');
	IdentificationType = new Model('identification-type', {
		schema: IdentificationTypeSchema,
		connection: database
	});

	let UserSchema = require('./../models/user');
	User = new Model('user', {
		schema: UserSchema,
		connection: database
	});

	let CurrencySchema = require('./../models/currency');
	Currency = new Model('currency', {
		schema: CurrencySchema,
		connection: database
	});

	let AccountSchema = require('./../models/account');
	Account = new Model('account', {
		schema: AccountSchema,
		connection: database
	});

	let CompanySchema = require('./../models/company');
	Company = new Model('company', {
		schema: CompanySchema,
		connection: database
	})
}

module.exports = {
	getConfig,
	getConfigAsync,
	getConfigs,
	saveConfig,
	updateConfig,
	uploadImage,
	uploadCrt,
	getImage,
	getImageBase64,
	deleteImage,
	getModel
}