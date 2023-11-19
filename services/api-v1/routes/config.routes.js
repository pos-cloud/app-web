'use strict'

var express = require('express');
var ConfigController = require('./../controllers/config.controller');
var api = express.Router();
var mdAuth = require('./../middlewares/auth.middleware');
var mdCheckLicense = require('./../middlewares/license.middleware');

var multer = require('multer');

var storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, '/home/clients/' + req.session.database + '/images/company/')
	},
	filename: function (req, file, cb) {
		cb(null, req.params.id + '-' + file.originalname.normalize('NFD').replace(/[\u0300-\u036f]/g, ""))
	}
})

var upload = multer({ storage: storage });

var storageCRT = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, '/home/clients/' + req.session.database + '/certificados/keys/')
	},
	filename: function (req, file, cb) {
		cb(null, "poscloud.crt")
	}
})

var uploadCRT = multer({ storage: storageCRT });

// V1
api.get('/config', [mdAuth.ensureAuth], ConfigController.getConfig);
api.post('/config', [mdAuth.ensureAuth], ConfigController.saveConfig);
api.put('/config', [mdAuth.ensureAuth], ConfigController.updateConfig);

// IMAGEN
api.get('/get-image-company/:picture/:database', ConfigController.getImage);
api.get('/get-image-base64-company', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], ConfigController.getImageBase64);
api.post('/upload-image-company/:id', [mdAuth.ensureAuth, mdCheckLicense.ensureLic, upload.single('image')], ConfigController.uploadImage);
api.post('/upload-crt', [mdAuth.ensureAuth, mdCheckLicense.ensureLic, uploadCRT.single('file')], ConfigController.uploadCrt);
api.delete('/delete-image-company', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], ConfigController.deleteImage);

// V2
api.get('/v2/configs', [mdAuth.ensureAuth], ConfigController.getConfigs);


api.get('/model', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], ConfigController.getModel);

module.exports = api;