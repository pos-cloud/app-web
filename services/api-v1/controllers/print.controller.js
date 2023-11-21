'use strict'

let fs = require('fs');
let ipp = require("ipp");
let fileController = require('./file.controller');
let constants = require('./../utilities/constants');
let config = require('./../config');
let jwt = require('jwt-simple');
let moment = require('moment');
moment.locale('es');

let Print;

function write(req, res, next) {

	initConnectionDB(req.session.database);

	let params = req.body;
	let print = new Print();

	print.fileName = params.fileName;
	print.content = params.content;

	let buffer = new Buffer(print.content);
	let mode = 'w'; //Para escribir y reemplazar el archivo
	// let mode = 'a'; //Para escribir al final del archivo

	fs.open(print.fileName + '.txt', mode, function (err, fd) {

		if (err) {
			fileController.writeLog(req, res, next, 500, err);
			return res.status(500).send(constants.ERR_SERVER);
		} else {
			fs.write(fd, buffer, 0, buffer.length, null, function (err) {
				if (err) {
					fileController.writeLog(req, res, next, 500, err);
					return res.status(500).send(constants.ERR_SERVER);
				} else {
					fs.close(fd, function () {
						fileController.writeLog(req, res, next, 200, "ok");
						return res.status(200).send({ message: "ok" });
					});
				}
			});
		}
	});
}

function toPrint(req, res, next) {

	initConnectionDB(req.session.database);

	let params = req.body;
	let print = new Print();

	print.content = params.content;
	print.printer = params.printer;

	let exec = require('child_process').exec;

	let command = print.printer.connectionURL + ' printername="' + print.printer.name + '" html="' + print.content + '"';

	exec(command, function (err, stdout, stderr) {
		if (err) {
			fileController.writeLog(req, res, next, 500, err);
			return res.status(500).send(constants.ERR_SERVER);
		} else {
			fileController.writeLog(req, res, next, 200, "ok");
			return res.status(200).send({ message: "ok" });
		}
	});
}

function read(req, res, next) {

	let params = req.params;

	let fileName = params.filename;

	fs.readFile(fileName + ".txt", function (err, data) {
		if (err) {
			fileController.writeLog(req, res, next, 500, err);
			return res.status(500).send(constants.ERR_SERVER);
		} else {
			fileController.writeLog(req, res, next, 200, "ok");
			return res.status(200).send(data.toString());
		}
	});
}

function toPrint(req, res, next) {

	initConnectionDB(req.session.database);

	let params = req.body;
	let print = new Print();

	print.name = params.name;
	print.content = params.content;

	let exec = require('child_process').exec;

	let command = 'C:\\printhtml printername="' + print.name + '" html="' + print.content + '"';

	exec(command, function (err, stdout, stderr) {
		if (err) {
			fileController.writeLog(req, res, next, 500, err);
			return res.status(500).send(constants.ERR_SERVER);
		}
		else {
			fileController.writeLog(req, res, next, 200, "ok");
			return res.status(200).send({ message: 'Se envio a la impresora correctamente' });
		}
	});
}

function execute(req, res, next) {

	let child = require('child_process').execFile;
	let executablePath = "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe";

	child(executablePath, function (err, data) {
		if (err) {
			fileController.writeLog(req, res, next, 500, err);
			return res.status(500).send(constants.ERR_SERVER);
		} else {
			fileController.writeLog(req, res, next, 200, "ok");
			return res.status(200).send(data.toString());
		}
	});
}

async function printInvoice(req, res, next) {

	let database = req.params.database;

	let data = fs.readFileSync('/home/clients/' + database + '/invoice/' + req.params.id + '.pdf');
	res.contentType("application/pdf");
	res.send(data);
}

async function printOthers(req, res, next) {

    let database = req.params.database;

	let data = fs.readFileSync('/home/clients/' + database + '/others/' + req.params.id + '.pdf');
	res.contentType("application/pdf");
	res.send(data);

}

async function printXML(req, res, next) {

	let data = fs.readFileSync('/var/www/html/libs/fe/mx/archs_cfdi/' + req.params.id + '.xml');
	res.contentType("text/xml");
	res.send(data);

}

function saveFile(req, res, next) {

	return res.status(200).send({ result: "ok" });
}

function toPrintURL(req, res, next) {

	process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

	let printer = ipp.Printer(req.query.url);

	fs.readFile(req.query.file, function (err, data) {
		if (err) {
			fileController.writeLog(req, res, next, 500, err);
			return res.status(500).send(constants.ERR_SERVER);
		} else {
			let msg = {
				"operation-attributes-tag": {
					"requesting-user-name": "pos",
					"document-format": "application/pdf"
				},
				data: data
			};

			printer.execute("Print-Job", msg, function (err, res2) {
				if (err) {
					fileController.writeLog(req, res, next, 500, err);
					return res.status(500).send(constants.ERR_SERVER);
				} else {
					fileController.writeLog(req, res, next, 200, JSON.stringify(res2));
					return res.status(200).send(JSON.stringify(res2));
				}
			});
		}
	});
}

function initConnectionDB(database) {
	let PrintSchema = require('./../models/print');
	const Model = require('./../models/model');
	Print = new Model('print', {
		schema: PrintSchema,
		connection: database
	});
}

module.exports = {
	write,
	toPrint,
	read,
	execute,
	printInvoice,
	printOthers,
	printXML,
	toPrintURL,
	saveFile
}