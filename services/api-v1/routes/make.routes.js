'use strict'

var moment = require('moment');
moment.locale('es');
var express = require('express');
var MakeController = require('./../controllers/make.controller');
var api = express.Router();
var mdAuth = require('./../middlewares/auth.middleware');
var mdCheckLicense = require('./../middlewares/license.middleware');
var multer = require('multer');

var storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, '/home/clients/' + req.session.database + '/images/make/')
	},
	filename: function (req, file, cb) {
        var name = moment().format('YYYY-MM-DD-THH_mm_ss').toString() + '-' + file.originalname.normalize('NFD').replace(/[\u0300-\u036f]/g, "");
        cb(null, name.replace(/ /g, "-"))
	}
})

var upload = multer({ storage: storage });

// V1
api.get('/make', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], MakeController.getMake);
api.get('/makes', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], MakeController.getMakes);
api.get('/sales-by-make', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], MakeController.getSalesByMake);
api.post('/make', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], MakeController.saveMake);
api.put('/make', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], MakeController.updateMake);
api.delete('/make', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], MakeController.deleteMake);

api.get('/get-image-make/:picture/:database', MakeController.getImage);
api.post('/upload-image-make/:id', [mdAuth.ensureAuth, mdCheckLicense.ensureLic, upload.single('image')], MakeController.uploadImage);



// V2
api.get('/v2/makes', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], MakeController.getMakesV2);

module.exports = api;