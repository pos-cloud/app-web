'use strict'

var express = require('express');
var FileController = require('./../controllers/file.controller');
var api = express.Router();
var mdAuth = require('./../middlewares/auth.middleware');
var mdCheckLicense = require('./../middlewares/license.middleware');
var constants = require('./../utilities/constants');
var multer = require("multer");

api.get('/export-citi', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], FileController.exportCiti);
api.get('/download-file/:filename', FileController.downloadFile);
api.post('/generate-crs', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], FileController.certAFIP);

var storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, constants.DOWNLOADS_PATH + req.session.database + '/certificados/keys/')
	},
	filename: function (req, file, cb) {
		cb(null, file.fieldname + '.crt')
	}
})

var upload = multer({ storage: storage });

api.post('/upload', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], upload.any('poscloud')), function (req, res) {
	return res.sendStatus(200)
};

module.exports = api;