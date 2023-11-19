'use strict'

let jwt = require('jwt-simple');
let moment = require('moment');
moment.locale('es');
let config = require('./../config');

exports.ensureAuth = function (req, res, next) {
	if (!req.headers.authorization) {
		let message = 'Debe iniciar sesión para realizar esta operación';
		return res.status(401).send({ message: message });
	}

	let token = req.headers.authorization.replace(/['"]+/g, '');
	let payload;
	try {
		payload = jwt.decode(token, config.TOKEN_SECRET);
	} catch (ex) {
		return res.status(401).send({ message: "Sesión expirada. Inicie Sesión nuevamente." });
	}

	req.session = payload;

	next();
};