'use strict'

var express = require('express');
var ResourceController = require('./../controllers/resource.controller');
var mdAuth = require('./../middlewares/auth.middleware');
var mdCheckLicense = require('./../middlewares/license.middleware');
var api = express.Router();
var fs = require('fs');
var multer = require('multer');
var moment = require('moment');
moment.locale('es');

var storage = multer.diskStorage({
	destination: function (req, file, cb) {

		fs.stat('/home/clients/' + req.session.database + '/resource/', function (err) {
			if (!err) {
				cb(null, '/home/clients/' + req.session.database + '/resource/')
			}
			else if (err.code === 'ENOENT') {
				mkdirpath('/home/clients/' + req.session.database + '/resource/');
				cb(null, '/home/clients/' + req.session.database + '/resource/')
			}
		});
	},
	filename: function (req, file, cb) {
		var name = moment().format('YYYY-MM-DD-THH_mm_ss').toString() + '-' + file.originalname.normalize('NFD').replace(/[\u0300-\u036f]/g, "");
        cb(null, name.replace(/ /g, "-"))
	}
})

var upload = multer({ storage: storage });

function mkdirpath(dirPath) {
	if (!fs.existsSync(dirPath)) {
		try {
			fs.mkdirSync(dirPath);
		}
		catch (e) {
			mkdirpath(path.dirname(dirPath));
			mkdirpath(dirPath);
			if (!e) {
			}
		}
	}
}

api.get('/resource', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], ResourceController.getResource);
api.get('/resources', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], ResourceController.getResources);
api.post('/resource', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], ResourceController.saveResource);
api.put('/resource', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], ResourceController.updateResource);
api.delete('/resource', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], ResourceController.deleteResource);


//archivos
api.get('/get-resource', ResourceController.getFile);
api.post("/upload-file", [mdAuth.ensureAuth, upload.single('image')], ResourceController.uploadFile)

module.exports = api;