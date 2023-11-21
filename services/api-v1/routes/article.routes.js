'use strict'

var moment = require('moment');
moment.locale('es');
var express = require('express');
var ArticleController = require('./../controllers/article.controller');
var api = express.Router();
var mdAuth = require('./../middlewares/auth.middleware');
var mdCheckLicense = require('./../middlewares/license.middleware');
var multer = require('multer');
var fs = require('fs');
const { API_CONNECTION_PASSWORD } = require('../config');

var storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, '/home/clients/' + req.session.database + '/images/article/')
	},
	filename: function (req, file, cb) {
		var name = moment().format('YYYY-MM-DD-THH_mm_ss').toString() + '-' + file.originalname.normalize('NFD').replace(/[\u0300-\u036f]/g, "");
        cb(null, name.replace(/ /g, "-"))
	}
})

var upload = multer({ storage: storage });


let storageExcelCreate = multer.diskStorage({
    destination: function (request, file, cb) {
        let path = "/home/clients/";
        if (request.session.database) {
            path += `${request.session.database}/excel`;
        }
        fs.mkdirSync(path, { recursive: true });
        cb(null, path);
    },
    filename: function (req, file, cb) {
        cb('', file.originalname)
    },
});

const uploadExcelCreate = multer({
    // storage: storage
    storage: storageExcelCreate
})
// V1
api.get('/article', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], ArticleController.getArticle);
api.get('/articles', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], ArticleController.getArticles);
api.get('/get-image-article/:picture/:database', ArticleController.getImage);
api.get('/get-best-selling-article', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], ArticleController.getBestSellingArticle);
api.post('/article', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], ArticleController.saveArticle);
api.post('/upload-image-article/:id', [mdAuth.ensureAuth, mdCheckLicense.ensureLic, upload.single('image')], ArticleController.uploadImage);
api.post('/upload-image-article', [mdAuth.ensureAuth, mdCheckLicense.ensureLic, upload.single('image')], ArticleController.uploadImageArray);
api.put('/article', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], ArticleController.updateArticle);
api.put('/update-prices', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], ArticleController.updatePrices);
api.delete('/article', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], ArticleController.deleteArticle);
api.delete('/delete-image-article', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], ArticleController.deleteImageArray);
// api.post('/article/create-article-excel',[mdAuth.ensureAuth, mdCheckLicense.ensureLic, uploadExcelCreate.single('excel')], ArticleController.createArticleExcel);
// V2
api.get('/v2/articles', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], ArticleController.getArticlesV2);
api.get('/get-image-base64-article/', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], ArticleController.getImageBase64);


module.exports = api;