'use strict'

var express = require('express');
var PrintController = require('./../controllers/print.controller');
var api = express.Router();
var mdAuth = require('./../middlewares/auth.middleware');
var mdCheckLicense = require('./../middlewares/license.middleware');

var multer = require('multer');

var storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, '/home/clients/' + req.session.database + '/' + req.params.folder + '/');
	},
	filename: function (req, file, cb) {
		cb(null, req.params.name + '.pdf');
	}
})

var upload = multer({ storage: storage });


api.post('/to-print', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], PrintController.toPrint);
api.get('/read/:filename', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], PrintController.read);

api.post('/upload-file/:folder/:name', [mdAuth.ensureAuth, mdCheckLicense.ensureLic, upload.single("file")], PrintController.saveFile);

api.get('/print/invoice/:database/:id', PrintController.printInvoice);
api.get('/print/others/:database/:id', PrintController.printOthers);
api.get('/print/xml/:id', PrintController.printXML);

api.get('/printURL', PrintController.toPrintURL);

module.exports = api;