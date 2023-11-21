'use strict'

var jwt = require('jwt-simple');
var moment = require('moment');
moment.locale('es');

// Payload
// EL Payload está compuesto por los llamados JWT Claims donde irán colocados la atributos que definen nuestro token.Exiten varios que puedes consultar aquí, los más comunes a utilizar son:
// sub: Identifica el sujeto del token, por ejemplo un identificador de usuario.
// iat: Identifica la fecha de creación del token, válido para si queremos ponerle una fecha de caducidad.En formato de tiempo UNIX
// exp: Identifica a la fecha de expiración del token.Podemos calcularla a partir del iat.También en formato de tiempo UNIX.


function generateTokenSession(req, res, next, user) {

	var config = require('./../config');
	var database = req.body.database;
	var ip = req.header('x-forwarded-for') || req.connection.remoteAddress;
	if (ip) {
		ip = ip.replace(/:/g, "").replace(/f/g, "");
	} else {
		ip = '';
	}

	var payload = {
		ip: ip,
		user: user._id,
		name: user.name,
		state: user.state,
		employee: user.employee,
		database: database,
		iat: moment().unix(),
		exp: moment().add(user.tokenExpiration, "minutes").unix(),
	};

	return jwt.encode(payload, config.TOKEN_SECRET);
}

async function generateTokenLicense(req, res, next) {
	await generateLicense(req, res, next)
		.then(result => { return res.status(200).send(result) })
		.catch(err => { return res.status(500).send(err) });
}

function generateLicense(req, res, next) {
	return new Promise((resolve, reject) => {
		//http://localhost:3000/api/generar-licencia/companyNumber=83&counter=true&resto=true&delivery=true&purchase=true&stock=true&currentAccount=true&electronicTransactions=true&variants=true&days=10

		var config = require('./../config');

		var counter = false;
		var resto = false;
		var delivery = false;
		var purchase = false;
		var stock = false;
		var money = false;
		var app = false;
		var kitchen = false;
		var prod = false;
		var woocommerce = false;
		var mercadolibre = false;
		var accounting = false;
		var gallery = false;
		var demo = false;
		var numberOfBranches = 1;
		var companyNumber;
		var days;
		var endDate;
		var expirationLicenseDate;
		let as;
		req.params.params = req.params.params.replace(/ /g, "").replace(/\t/g, "").replace(/\n/g, "");
		if (req.params.params !== undefined) {
			req.params.params.split("&").forEach(function (part) {
				var item = part.split("=");
				switch (item[0]) {
					case 'counter':
						counter = item[1];
						break;
					case 'resto':
						resto = item[1];
						break;
					case 'delivery':
						delivery = item[1];
						break;
					case 'purchase':
						purchase = item[1];
						break;
					case 'stock':
						stock = item[1];
						break;
					case 'money':
						money = item[1];
						break;
					case 'numberOfBranches':
						numberOfBranches = item[1];
						break;
					case 'companyNumber':
						companyNumber = item[1];
						break;
					case 'app':
						app = item[1];
						break;
					case 'kitchen':
						kitchen = item[1];
						break;
					case 'prod':
						prod = item[1];
						break;
					case 'woocommerce':
						woocommerce = item[1];
						break;
					case 'mercadolibre':
						mercadolibre = item[1];
						break;
					case 'accounting':
						accounting = item[1];
						break;
					case 'gallery':
						gallery = item[1];
						break;
					case 'days':
						days = item[1];
						break;
					case 'demo':
						demo = item[1];
						break;
					case 'expirationLicenseDate':
						expirationLicenseDate = item[1];
						break;
					case 'endDate':
						endDate = moment(item[1], 'DD-MM-YYYY').format('YYYY-MM-DD');
						var now = moment().format('YYYY-MM-DD');
						days = getDifferenceBetweenDates(now.toString(), endDate.toString());
						break;
				}
			});
		}
		if (!companyNumber || companyNumber == 0) {
			reject("El código de la compania no es correcto");
		}

		var exp;
		var licensePaymentDueDate;

		if (!days || (days == 0 && !endDate)) {
			reject("La cantidad de días de licencia no es correcta");
		} else if (!days || days == 0) {
			exp = moment(endDate + "T23:59:59.000Z").unix();
			licensePaymentDueDate = moment(endDate).format('YYYY-MM-DD');
		} else {
			exp = moment().add(days, "days").unix();
			licensePaymentDueDate = moment().add(days, "days").format('YYYY-MM-DD');;
		}

		if (!expirationLicenseDate) {
			expirationLicenseDate = licensePaymentDueDate;
		}
		var modules = `{
			"sale": {
				"resto": ${resto},
				"counter": ${counter},
				"delivery": ${delivery}
			},
			"production": {
				"pos": ${prod},
				"kitchen": ${kitchen}
			},
			"woocommerce": ${woocommerce},
			"mercadolibre": ${mercadolibre},
			"accounting": ${accounting},
			"purchase": ${purchase},
			"stock": ${stock},
			"money": ${money},
			"numberOfBranches": ${numberOfBranches},
			"gallery": ${gallery},
			"app": ${app},
			"demo": ${demo}
		}`;

		var payload = {
			number: pad(companyNumber, 6),
			modules: modules,
			iat: moment().unix(),
			exp: exp
		};

		var license = jwt.encode(payload, config.LIC_PASSWORD);

		resolve({ license: license, licensePaymentDueDate: licensePaymentDueDate, expirationLicenseDate: expirationLicenseDate, modules: JSON.parse(modules) });
	});
}

function generateToken(req, email, minutes, action) {

	var config = require('./../config');
	var database = req.session.database;
	var ip = req.header('x-forwarded-for') || req.connection.remoteAddress;
	if (ip) {
		ip = ip.replace(/:/g, "").replace(/f/g, "");
	} else {
		ip = '';
	}

	var payload = {
		ip: ip,
		email: email,
		database: database,
		action: action,
		iat: moment().unix(),
		exp: moment().add(minutes, "minutes").unix(),
	};

	return jwt.encode(payload, config.TOKEN_SECRET);
}

function getDifferenceBetweenDates(startDate, endDate) {

	let start = moment(startDate, 'YYYY-MM-DDTHH:mm:ssZ');
	let end = moment(endDate, 'YYYY-MM-DDTHH:mm:ssZ');
	let diff = end.diff(start, "days");

	return diff;
}

function pad(n, length) {
	var n = n.toString();
	while (n.length < length)
		n = "0" + n;
	return n;
}

module.exports = {
	generateToken,
	generateTokenSession,
	generateTokenLicense,
	generateLicense
}