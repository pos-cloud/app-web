'use strict'
var moment = require('moment');
moment.locale('es');
var express = require('express');
var CategoryController = require('./../controllers/category.controller');
var api = express.Router();
var mdAuth = require('./../middlewares/auth.middleware');
var mdCheckLicense = require('./../middlewares/license.middleware');

var multer = require('multer');

var storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, '/home/clients/' + req.session.database + '/images/category/')
	},
	filename: function (req, file, cb) {
        var name = moment().format('YYYY-MM-DD-THH_mm_ss').toString() + '-' + file.originalname.normalize('NFD').replace(/[\u0300-\u036f]/g, "");
        cb(null, name.replace(/ /g, "-"))
	}
})

var upload = multer({ storage: storage });

// V1
api.get('/category', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], CategoryController.getCategory);
api.get('/categories', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], CategoryController.getCategories);
api.get('/get-image-category/:picture/:database', CategoryController.getImage);
api.get('/sales-by-category', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], CategoryController.getSalesByCategory);
api.post('/category', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], CategoryController.saveCategory);
api.post('/upload-image-category/:id', [mdAuth.ensureAuth, mdCheckLicense.ensureLic, upload.single('image')], CategoryController.uploadImage);
api.put('/category', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], CategoryController.updateCategory);
api.delete('/category', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], CategoryController.deleteCategory);

// V2
api.get('/v2/categories', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], CategoryController.getCategoriesV2);

module.exports = api;