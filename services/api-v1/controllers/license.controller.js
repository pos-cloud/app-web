
//--https://www.npmjs.com/package/ftp-client

'use strict'

let fileController = require('./file.controller');
let constants = require('./../utilities/constants');
let mp = require("mercadopago");
let moment = require('moment');
moment.locale('es');

let Config;

function ftpConnection(req, res, next) {

	if (req.session) {
		initConnectionDB(req.session.database);

		let config = new Config();

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
					return res.status(200).send(constants.NO_DATA_FOUND);
				} else {
					config = configs[0];
					let ftpClient = require('ftp-client'),
						configftp = {
							host: 'c0930101.ferozo.com',
							port: 21,
							user: 'licenses@poscloud.com.ar',
							password: 'licPOSCLOUD04'
						},
						options = {
							logging: 'basic'
						},
						client = new ftpClient(configftp, options);

					client.connect(function () {

						client.download('/' + config.numberCompany, 'lic', {
							overwrite: 'all'
						}, function (result) {
							fileController.writeLog(req, res, next, 200, "Se actualizo la licencia");
							return res.status(200).send({ message: "Se actualizo la licencia" });
						});

					});
				}
			}
		});
	} else {
		console.log(moment().format('DD-MM-YYYY hh:mm:ss') + " - Database undefined");
	}
}

function generateLicensePayment(req, res, next) {

	initConnectionDB(req.session.database);

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
				const preferences_data = {
					items: [
						{
							title: "Abono de Licencia " + req.session.database,
							description: "Licencia POS Cloud de " + req.session.database,
							quantity: 1,
							currency_id: "ARS",
							unit_price: configs[0].balance
						}
					],
					collector_id: 291164642
				}
				mp.configurations.setAccessToken('APP_USR-691737747158775-021408-ba72bd39515dff19c39b4c138bf4e2d1__LC_LD__-291164642');
				mp.createPreference(preferences_data)
					.then((preference) => {
						sendEmailToSales(req, res, next, preferences_data, preference);
						fileController.writeLog(req, res, next, 200, { paymentLink: preference.response.init_point });
						return res.status(200).send({ paymentLink: preference.response.init_point });
					}).catch(error => {
						fileController.writeLog(req, res, next, 200, error);
						return res.status(200).send({ message: error.message });
					});
			}
		}
	});
}

function sendEmailToSales(req, res, next, preferences_data, preference) {

	const nodemailer = require('nodemailer');

	let email = "ventas.poscloud@gmail.com";
	let subject = `PAGO de ${req.session.database} por ${preferences_data.items[0].unit_price}`;

	nodemailer.createTestAccount((err, account) => {

		let transporter = nodemailer.createTransport({
			service: "Gmail",
			auth: {
				user: email,
				pass: "FylPOSCLOUD04"
			}
		});

		let message = `Se genero comprobante de pago para ${req.session.database}:
			Request:  ${JSON.stringify(preferences_data)}
			Result:  ${JSON.stringify(preference)}`;

		let mailOptions = {
			from: "<" + email + ">", // sender address
			to: "info@poscloud.com.ar", // list of receivers
			subject: subject, // Subject line
			// text: message, // plain text body
			html: message // html body
		};

		transporter.sendMail(mailOptions, (err, info) => {
			if (err) {
			}
		});
	});
}

function initConnectionDB(database) {

	const Model = require('./../models/model');

	let ConfigSchema = require('./../models/config');
	Config = new Model('config', {
		schema: ConfigSchema,
		connection: database
	});
}

module.exports = {
	ftpConnection,
	generateLicensePayment
}