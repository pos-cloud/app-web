'use strict'

let fs = require('fs');
let moment = require('moment');
moment.locale('es');
const path = require('path');
const constants = require('./../utilities/constants');
const config = require('./../config');
let Transaction;
let Company;
let TransactionType;
let VATCondition;
let IdentificationType;
let Tax;

const Sentry = require("@sentry/node");

function writeLog(req, res, next, status, text) {


	// let rootFile = constants.DOWNLOADS_PATH;

	// if (!fs.existsSync(rootFile)) {
	// 	try {
	// 		fs.mkdirSync(rootFile);
	// 	} catch (e) {
	// 	}
	// }

	// if (req.session) {
	// 	rootFile += req.session.database;
	// }

	// if (!fs.existsSync(rootFile)) {
	// 	try {
	// 		fs.mkdirSync(rootFile);
	// 	} catch (e) {
	// 	}
	// }

	// rootFile += '/logs/';

	// if (!fs.existsSync(rootFile)) {
	// 	try {
	// 		fs.mkdirSync(rootFile);
	// 	} catch (e) {
	// 	}
	// }

	// let fileName = rootFile + 'LOG-' + moment().format('DD-MM-YYYY') + '.txt';

	// let agent;
	// if (req.rawHeaders) {
	// 	for (let i = 0; i < req.rawHeaders.length; i++) {
	// 		if (req.rawHeaders[i] === "User-Agent") {
	// 			agent = req.rawHeaders[i + 1];
	// 		}
	// 	}
	// }

	// let user = { name: "", user: "" };
	// let database = '';
	// if (req.session) {
	// 	user = req.session;
	// 	database = req.session.database;
	// }


	// let message = moment().format('HH:mm:ss') +
	// 	" -METHOD " + req.method +
	// 	" -URL " + req.headers.referer +
	// 	" -O-URL " + req.originalUrl + '\r\n\t\t' +
	// 	" -PARAMS " + JSON.stringify(req.params) + '\r\n\t\t' +
	// 	" -BODY " + JSON.stringify(req.body) + '\r\n\t\t' +
	// 	" -D " + database + '\r\n\t\t' +
	// 	" -USER " + user.name + "(" + user.user + ")" + '\r\n\t\t' +
	// 	" -CLIENT " + agent + '\r\n\t\t' +
	// 	" -STATUS " + status + '\r\n\t\t' +
	// 	" -MSN " + text;

	// let buffer = new Buffer(message + '\r\n');
	// let mode = 'a';

	// fs.open(fileName, mode, function (err, fd) {

	// 	if (err) {
	// 		return console.log(err);
	// 	} else {
	// 		fs.write(fd, buffer, 0, buffer.length, null, function (err) {
	// 			if (err) {
	// 				return console.log(err);
	// 			} else {
	// 				fs.close(fd, function () {
	// 				});
	// 			}
	// 		});
	// 	}
	// });

	// if (status === 500) {
	// 	console.log(message);
	// 	try {
	// 		Sentry.captureException(text);
	// 	} catch(error) {
	// 		console.log(error);
	// 	}

	// 	req.body.claim = {
	// 		name: text,
	// 		description: message,
	// 		listName: 'ERRORES 500'
	// 	};

	// 	if (req.headers.referer &&
	// 		!req.headers.referer.toString().includes("localhost")) {
	// 	}

	// 	let fileName = rootFile + 'ERR-' + moment().format('DD-MM-YYYY') + '.txt';

	// 	fs.open(fileName, mode, function (err, fd) {

	// 		if (err) {
	// 			return console.log(err);
	// 		} else {
	// 			fs.write(fd, buffer, 0, buffer.length, null, function (err) {
	// 				if (err) {
	// 					return console.log(err);
	// 				} else {
	// 					fs.close(fd, function () {
	// 					});
	// 				}
	// 			});
	// 		}
	// 	});
	// }
}

function read(req, res, next) {

	let params = req.params;

	let fileName = params.filename;

	fs.readFile(fileName + ".txt", function (err, data) {
		if (err) {
			return res.status(200).send({ message: 'Error al abrir el archivo.' });
		} else {
			return res.status(200).send(data.toString());
		}
	});
}

function execute(req, res, next) {

	let child = require('child_process').execFile;
	let executablePath = "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe";

	child(executablePath, function (err, data) {
		if (err) {
			return res.status(200).send({ message: 'Error al ejecutar la aplicación.' });
		} else {
			return res.status(200).send(data.toString());
		}
	});
}

function generateCiti(req, res, next, transactions, VATPeriod, transactionMovement) {

	let fileComp = "";
	let fileAli = "";

	for (let transaction of transactions) {

		let origin = padNumber(transaction.origin, 5);
		let number = padNumber(transaction.number, 20);
		let date = moment(transaction.endDate).format("YYYYMMDD");
		let expirationDate = moment(transaction.expirationDate).format("YYYYMMDD");

		if (!transaction.type) {
			return res.status(200).send({ message: "Ha ocurrido un error con el comprobante Nº " + transaction.origin + "-" + transaction.letter + "-" + transaction.number + " comunicarse con Soporte." });
		}

		if (transaction.origin === 0) {
			return res.status(200).send({ message: "El comprobante " + transaction.type.name + " de " + transaction.type.transactionMovement + " Nº " + transaction.origin + "-" + transaction.letter + "-" + transaction.number + " no puede tener punto de venta 0." });
		}

		let transactionTypeNumber;
		if (transaction.type && transaction.type.codes && transaction.type.codes.length > 0) {
			for (let i = 0; i < transaction.type.codes.length; i++) {
				if (transaction.type.codes[i].letter === transaction.letter) {
					transactionTypeNumber = transaction.type.codes[i].code;
					transactionTypeNumber = padNumber(transactionTypeNumber, 3);
				}
			}
		} else {
			return res.status(200).send({ message: "El comprobante " + transaction.type.name + " Nº " + transaction.origin + "-" + transaction.letter + "-" + transaction.number });
		}

		if (!transactionTypeNumber || transactionTypeNumber === "000") {
			return res.status(200).send({ message: "El comprobante " + transaction.type.name + " Nº " + transaction.origin + "-" + transaction.letter + "-" + transaction.number + " falta de configurar el código de AFIP para la letra del comprobante." });
		}

		let identityType = '99';
		let identity = '0';
		let companyName;
		if (transaction.company) {
			if (transaction.company.identificationType &&
				transaction.company.identificationType.code &&
				transaction.company.identificationValue &&
				transaction.company.identificationValue !== '') {
				identityType = transaction.company.identificationType.code;
				identity = transaction.company.identificationValue.replace(/-/gi, "").replace(/ /gi, "");
			}
			companyName = padString(transaction.company.name
				.toUpperCase()
				.replace(/Ñ/gi, "N")
				.replace(/Á/gi, "A")
				.replace(/É/gi, "E")
				.replace(/Í/gi, "I")
				.replace(/Ó/gi, "O")
				.replace(/Ú/gi, "U")
				.replace(/º/gi, ""), 30)
				.slice(0, 30);
		} else {
			companyName = padString("CONSUMIDOR FINAL", 30);
		}

		identity = padNumber(identity, 20);

		let totalPrice = padNumber((((transaction.totalPrice).toFixed(2)).toString()).replace(".", ""), 15);
		let exempt = padNumber((((transaction.exempt).toFixed(2)).toString()).replace(".", ""), 15);
		let impPercepcionNoCategorizadas = padNumber(0, 15);
		let conceptosNoIntegranAlNeto = padNumber(0, 15);
		let impPercepcionCtaImpNac = 0;
		let impPercepcionIngBruto = 0;
		let impPercepcionporImpMunicipal = 0;
		let impImpuestoInterno = 0;
		let impPercepcionIVA = 0;
		let tipoMoneda = 'PES';
		let tipoCambio = '0001000000';
		let codigoOperacion;
		let otrosTributos = padNumber(0, 15);
		let cantAlicuota = 0;
		let credFiscalComputable = 0;

		if (transaction.taxes && transaction.taxes.length > 0) {
			for (let taxes of transaction.taxes) {
				if (taxes.tax) {
					if (taxes.tax.classification === 'Impuesto') {
						if (taxes.tax.type &&
							taxes.tax.type === 'Nacional' &&
							taxes.tax.taxBase &&
							taxes.tax.taxBase === 'Gravado') {
							cantAlicuota++;
							credFiscalComputable += taxes.taxAmount;
						} else {
							impImpuestoInterno += taxes.taxAmount;
						}
					} else if (taxes.tax.type === 'Nacional') {
						impPercepcionCtaImpNac += taxes.taxAmount;
					} else if (taxes.tax.type === 'Provincial') {
						impPercepcionIngBruto += taxes.taxAmount;
					} else if (taxes.tax.type === 'Municipal') {
						impPercepcionporImpMunicipal += taxes.taxAmount;
					}
				}
			}
			codigoOperacion = '0';
		} else {
			codigoOperacion = 'E';
		}

		impImpuestoInterno = padNumber((((impImpuestoInterno).toFixed(2)).toString()).replace(".", ""), 15);
		impPercepcionCtaImpNac = padNumber((((impPercepcionCtaImpNac).toFixed(2)).toString()).replace(".", ""), 15);
		impPercepcionIngBruto = padNumber((((impPercepcionIngBruto).toFixed(2)).toString()).replace(".", ""), 15);
		impPercepcionIVA = padNumber((((impPercepcionIVA).toFixed(2)).toString()).replace(".", ""), 15);
		impPercepcionporImpMunicipal = padNumber((((impPercepcionporImpMunicipal).toFixed(2)).toString()).replace(".", ""), 15);
		credFiscalComputable = padNumber((((credFiscalComputable).toFixed(2)).toString()).replace(".", ""), 15);

		if (transactionMovement === "Venta") {

			if (cantAlicuota === 0) {
				cantAlicuota = 1;
			}

			let newLine = date +
				transactionTypeNumber +
				origin +
				number + //Desde
				number + //Hasta
				identityType +
				identity +
				companyName +
				totalPrice +
				conceptosNoIntegranAlNeto +
				impPercepcionNoCategorizadas + // percepciones a no categorizados 
				exempt +
				impPercepcionCtaImpNac +
				impPercepcionIngBruto +
				impPercepcionporImpMunicipal +
				impImpuestoInterno +
				tipoMoneda +
				tipoCambio + //tipo de cambio
				cantAlicuota + // cantidad de alicuotas de iva
				codigoOperacion + // codigo de operacion
				otrosTributos + // tros tributos
				expirationDate + // Fecha vencimiento
				"\r\n";
			fileComp += newLine;
		} else {
			// CALCULO DE CANTIDAD DE ALICUOTAS
			if (transaction.company && transaction.company.vatCondition && transaction.company.vatCondition.discriminate === false) {
				cantAlicuota = 0;
			}

			// CALCULO DE EXENTO
			if (transaction.letter === "B" || transaction.letter === "C") {
				exempt = padNumber((((0).toFixed(2)).toString()).replace(".", ""), 15);
			}

			if (transaction.letter === "A" && cantAlicuota === 0) {
				cantAlicuota = 1;
			}

			let newLine =
				date + // 1 - 8
				transactionTypeNumber + // 9 - 11
				origin + // 12 - 16
				number + // 17 - 36
				padString(' ', 16) + // 37 - 52  Nº despacho de importación
				identityType + // 53 - 54
				identity +	// 55 - 74
				companyName + // 75 - 104
				totalPrice + // 105 - 119
				conceptosNoIntegranAlNeto + // 120 - 134
				exempt + // 135 - 149
				'000000000000000' + // 150 - 164 impPercIVA 
				impPercepcionCtaImpNac + // 165 - 179
				impPercepcionIngBruto + //180 - 194
				impPercepcionporImpMunicipal + // 195 - 209
				impImpuestoInterno + // 210 - 224
				tipoMoneda + // 225 - 227
				tipoCambio + // 228 - 237 tipo de cambio
				cantAlicuota + // 238 - 238 cantidad de alicuotas de iva
				codigoOperacion + // 239 - 239 codigo de operacion
				credFiscalComputable + // 240 - 254 cred fiscal computable
				otrosTributos + // 255 - 269 otros tributos
				padNumber(0, 11) + // 270 - 280 cuit emisor
				padString(' ', 30) + // 281 - 310 denominacion emisor
				padNumber(0, 15) + // 311 - 325 iva comision
				"\r\n";

			fileComp += newLine;

		}

		let codAlicuota = '0003'; // Defecto exento / SIN IVA
		let taxBase = 0;
		let taxAmount = 0;

		if (transaction.taxes && transaction.taxes.length > 0) {

			for (let i = 0; i < transaction.taxes.length; i++) {

				if (transaction.taxes[i].tax && transaction.taxes[i].tax.classification === 'Impuesto') {
					if (transaction.taxes[i].tax.type &&
						transaction.taxes[i].tax.type === 'Nacional' &&
						transaction.taxes[i].tax.taxBase &&
						transaction.taxes[i].tax.taxBase === 'Gravado') {
						codAlicuota = padNumber(transaction.taxes[i].tax.code, 4);
						taxBase = padNumber((((transaction.taxes[i].taxBase).toFixed(2)).toString()).replace(".", ""), 15);//completar
						taxAmount = padNumber((((transaction.taxes[i].taxAmount).toFixed(2)).toString()).replace(".", ""), 15);//completar

						if (transactionMovement === "Venta") {
							fileAli +=
								transactionTypeNumber + // 1 - 3
								origin + // 4 - 8
								number + // 9 - 28 
								taxBase + // 29 - 43
								codAlicuota + // 44 - 47
								taxAmount + // 48 - 68
								"\r\n";
						} else {
							fileAli +=
								transactionTypeNumber + // 1 - 3
								origin + // 4 - 8
								number + // 9 - 28 
								identityType + // 29 - 30
								identity +	// 31 - 50
								taxBase + // 51 - 65
								codAlicuota + // 66 - 69
								taxAmount + // 70 - 84
								"\r\n";
						}
					}
				}
			}
		} else {
			if (transactionMovement === "Venta") {
				fileAli +=
					transactionTypeNumber +
					origin +
					number +
					padNumber((((taxBase).toFixed(2)).toString()).replace(".", ""), 15) +
					codAlicuota +
					padNumber((((taxAmount).toFixed(2)).toString()).replace(".", ""), 15) +
					"\r\n";
			} else {
				if (cantAlicuota === 1) {
					fileAli +=
						transactionTypeNumber + // 1 - 3
						origin + // 4 - 8
						number + // 9 - 28 
						identityType + // 29 - 30
						identity +	// 31 - 50
						padNumber((((0.00).toFixed(2)).toString()).replace(".", ""), 15) +
						codAlicuota + // 66 - 69
						padNumber((((0.00).toFixed(2)).toString()).replace(".", ""), 15) +
						"\r\n";
				}
			}
		}
	}

	// let rootFile = constants.DOWNLOADS_PATH + req.session.database + "/";
	mkdirpath(constants.DOWNLOADS_PATH + req.session.database + '/CITI/');
	mkdirpath(constants.DOWNLOADS_PATH + req.session.database + '/CITI/Compras/');
	mkdirpath(constants.DOWNLOADS_PATH + req.session.database + '/CITI/Ventas/');

	let rootFile = constants.DOWNLOADS_PATH + req.session.database + '/CITI/' + transactionMovement + 's';

	if (!fs.existsSync(rootFile)) {
		fs.mkdirSync(rootFile);
	}


	fs.writeFile(rootFile + '/comp' + VATPeriod + '.txt', fileComp, function (err) {
		if (err) {
			return res.status(404).send(err);
		}
		else
			fs.writeFile(rootFile + '/ali' + VATPeriod + '.txt', fileAli, function (err) {
				if (err) {
					return res.status(404).send(err);
				}
				else {
					return res.status(200).send({ message: 'OK' });
				}
			});
	});
}

function exportCiti(req, res, next) {

	initConnectionDB(req.session.database);

	let VATPeriod = JSON.parse(req.query.query).VATPeriod;
	let transactionMovement = JSON.parse(req.query.query).transactionMovement;

	Transaction.find({ $and: [{ 'VATPeriod': VATPeriod }, { "state": "Cerrado" }, { "operationType": { "$ne": "D" } }] })
		.sort({ "endDate": 1 })
		.populate({
			path: 'type',
			model: TransactionType,
			match: ({ $and: [{ 'tax': true }, { "transactionMovement": transactionMovement }] })
		})
		.populate({
			path: 'taxes.tax',
			model: Tax
		})
		.populate({
			path: 'company',
			model: Company,
			populate: [{
				path: 'vatCondition',
				model: VATCondition,
			},
			{
				path: 'identificationType',
				model: IdentificationType,
			}]
		})
		.exec((err, transactions) => {
			if (err) {
				return res.status(500).send(constants.ERR_SERVER);
			} else {
				let transactionsAux = new Array();
				for (let transaction of transactions) {
					if (transaction.type) {
						transactionsAux.push(transaction);
					}
				}
				if (transactionsAux.length === 0) {
					return res.status(200).send({ message: "No se encontraron comprobantes en el período ingresado." });
				} else {
					generateCiti(req, res, next, transactionsAux, VATPeriod, transactionMovement);
				}
			}
		});
}

function certAFIP(req, res, next) {

	mkdirpath(constants.DOWNLOADS_PATH + req.session.database + '/certificados');
	mkdirpath(constants.DOWNLOADS_PATH + req.session.database + '/certificados/keys');
	mkdirpath(constants.DOWNLOADS_PATH + req.session.database + '/certificados/xml');


	const companyCUIT = req.body.companyIdentificationValue.replace(new RegExp('-', 'gi'), '');
	const companyName = req.body.companyName.replace(new RegExp(' ', 'gi'), '');
	let subj = "//C=AR/O=" + companyName + "/CN=POSCLOUD/serialNumber=CUIT " + companyCUIT;

	let exec = require('child_process').exec, child;

	child = exec('openssl genrsa -out ' + constants.DOWNLOADS_PATH + req.session.database + '/certificados/keys/poscloud.key 2048', function (err, stdout, stderr) {
		if (err) {
			return res.status(500).send('Error al generar la KEY: ' + err);
		} else {
			let exec = require('child_process').exec, child;
			child = exec('openssl req -new -key ' + constants.DOWNLOADS_PATH + req.session.database + '/certificados/keys/poscloud.key -subj "' + subj + '" -out ' + constants.DOWNLOADS_PATH + req.session.database + '/certificados/keys/poscloud.csr', function (err, stdout, stderr) {
				if (err) {
					return res.status(500).send('Error al generar CRS:' + err);
				} else {
					return res.status(200).send({ message: "Generado Correctamente!" });
				}
			});
		}
	});
}

function downloadFile(req, res, next) {

	let route = constants.DOWNLOADS_PATH + req.params.filename.replace(new RegExp('-', 'gi'), '/');

	return res.download(route);
}

function mkdirpath(dirPath) {
	if (!fs.existsSync(dirPath)) {
		try {
			fs.mkdirSync(dirPath);
		}
		catch (e) {
			mkdirpath(path.dirname(dirPath));
			mkdirpath(dirPath);
			if (!e) {
				console.log("Error al crear directorio:" + e);
			}
		}
	}
}

function padNumber(n, length) {
	n = (n != null) ? n.toString() : '0';
	while (n.length < length)
		n = "0" + n;
	return n;
}

function padString(n, length) {
	n = (n != null) ? n.toString() : '0';
	while (n.length < length)
		n += " ";
	return n;
}

function initConnectionDB(database) {

	const Model = require('./../models/model');

	let TransactionSchema = require('./../models/transaction');
	Transaction = new Model('transaction', {
		schema: TransactionSchema,
		connection: database
	});

	let CompanySchema = require('./../models/company');
	Company = new Model('company', {
		schema: CompanySchema,
		connection: database
	});

	let VATConditionSchema = require('./../models/vat-condition');
	VATCondition = new Model('vat-condition', {
		schema: VATConditionSchema,
		connection: database
	});

	let TransactionTypeSchema = require('./../models/transaction-type');
	TransactionType = new Model('transaction-type', {
		schema: TransactionTypeSchema,
		connection: database
	});

	let IdentificationTypeSchema = require('./../models/identification-type');
	IdentificationType = new Model('identification-type', {
		schema: IdentificationTypeSchema,
		connection: database
	});

	let TaxSchema = require('./../models/tax');
	Tax = new Model('tax', {
		schema: TaxSchema,
		connection: database
	});
}

module.exports = {
	writeLog,
	read,
	execute,
	exportCiti,
	downloadFile,
	certAFIP
}