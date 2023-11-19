'use strict'

var express = require('express');
var ArticleFieldController = require('./../controllers/article-field.controller');
var api = express.Router();
var mdAuth = require('./../middlewares/auth.middleware');
var mdCheckLicense = require('./../middlewares/license.middleware');

// V1
api.get('/article-field', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], ArticleFieldController.getArticleField);
api.get('/article-fields', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], ArticleFieldController.getArticleFields);
api.post('/article-field', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], ArticleFieldController.saveArticleField);
api.put('/article-field', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], ArticleFieldController.updateArticleField);
api.delete('/article-field', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], ArticleFieldController.deleteArticleField);

// V2
api.get('/v2/article-fields', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], ArticleFieldController.getArticleFieldsV2);

module.exports = api;