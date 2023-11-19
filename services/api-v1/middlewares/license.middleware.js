'use strict'

let jwt = require('jwt-simple');
let moment = require('moment');
moment.locale('es');
let config = require('./../config');
let constants = require('./../utilities/constants');
let fileController = require('./../controllers/file.controller');
const constans = require('./../utilities/constants');

let Config;

exports.ensureLic = function (req, res, next) {

	initConnectionDB(req.session.database);

	Config.find().exec((err, configs) => {
		if (err) {
			fileController.writeLog(req, res, next, 500, constants.ERR_SERVER);
			return res.status(500).send(constants.ERR_SERVER);
		} else {
			let message = "El comercio no pudo registrarse correctamente. Comuníquese con Soporte.";
			if (!configs) {
				fileController.writeLog(req, res, next, 500, message);
				return res.status(500).send(message);
			} else if (configs.length === 0) {
				fileController.writeLog(req, res, next, 404, message);
				return res.status(404).send(message);
			} else {
				let configCli = configs[0];
				let token = configCli.license;
				let payload;
				try {
					payload = jwt.decode(token, config.LIC_PASSWORD);
					if (payload.number !== configCli.numberCompany) {
						fileController.writeLog(req, res, next, 200, "La licencia no corresponde");
						return res.status(200).send({ message: "La licencia no corresponde" });
					} else {
						configCli.licensePaymentDueDate = moment.unix(payload.exp).format("DYYYY-MM-DDTHH:mm:ssZ");
					}

					if (payload.exp <= moment().unix()) {
						fileController.writeLog(req, res, next, 401, "La licencia no corresponde");
						return res.status(401).send({ message: "La licencia no corresponde" });
					} else {
						if (configCli.modules && payload.modules) {
							let modules;
							try {
								modules = JSON.parse(payload.modules);
							} catch (err) {
								fileController.writeLog(req, res, next, 500, err);
								return res.status(500).send(constants.ERR_SERVER);
							}
							if (!isValidModule(modules, configCli.modules)) {
								if (payload.modules) {
									let modules;
									try {
										modules = JSON.parse(payload.modules);
									} catch (err) {
										fileController.writeLog(req, res, next, 500, err);
										return res.status(500).send(constants.ERR_SERVER);
									}
									configCli.modules = modules;
								} else {
									configCli.modules = [];
								}
								updateConfig(req, res, next, configCli);
							}
						} else {
							if (payload.modules) {
								let modules;
								try {
									modules = JSON.parse(payload.modules);
								} catch (err) {
									fileController.writeLog(req, res, next, 500, err);
									return res.status(500).send(constants.ERR_SERVER);
								}
								configCli.modules = modules;
							} else {
								configCli.modules = [];
							}
							updateConfig(req, res, next, configCli);
						}
					}
				} catch (ex) {
					console.log("La licencia ha expirado para " + req.session.database);
					fileController.writeLog(req, res, next, 200, "La licencia ha expirado");
					return res.status(200).send({ message: "La licencia ha expirado" });
				}

				next();
			}
		}
	});
}

function updateConfig(req, res, next, config) {

	initConnectionDB(req.session.database);

	Config.findByIdAndUpdate(config._id, config, (err, configUpdated) => {
		if (err) {
			fileController.writeLog(req, res, next, 500, constans.ERR);
			return res.status(500).send({ message: constans.ERR });
		}
	});
}

function isValidModule(modules, mod) {
	
	let isValid = true;

	if (modules.sale.resto !== mod.sale.resto) {
		isValid = false;
	}

	if (modules.sale.counter !== mod.sale.counter) {
		isValid = false;
	}

	if (modules.sale.delivery !== mod.sale.delivery) {
		isValid = false;
	}

	if (modules.purchase !== mod.purchase) {
		isValid = false;
	}

	if (modules.production.pos !== mod.production.pos) {
		isValid = false;
	}


	if (modules.production.kitchen !== mod.production.kitchen) {
		isValid = false;
	}

	if (modules.mercadolibre !== mod.mercadolibre) {
		isValid = false;
	}

	if (modules.woocommerce !== mod.woocommerce) {
		isValid = false;
	}

	if (modules.accounting !== mod.accounting) {
		isValid = false;
	}

	if (modules.stock !== mod.stock) {
		isValid = false;
	}

	if (modules.demo !== mod.demo) {
		isValid = false;
	}

	if (modules.gallery !== mod.gallery) {
		isValid = false;
	}

	return isValid;
}

function initConnectionDB(database) {
	let ConfigSchema = require('./../models/config');
	const Model = require('./../models/model');
	Config = new Model('config', {
		schema: ConfigSchema,
		connection: database
	});
}
