'use strict'

var express = require('express');
var ArticleStockController = require('./../controllers/article-stock.controller');
var api = express.Router();
var mdAuth = require('./../middlewares/auth.middleware');
var mdCheckLicense = require('./../middlewares/license.middleware');

// V1
api.get('/article-stock', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], ArticleStockController.getArticleStock);
api.get('/article-stocks', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], ArticleStockController.getArticleStocks);
api.post('/article-stock', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], ArticleStockController.saveArticleStock);
api.put('/article-stock', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], ArticleStockController.updateArticleStock);
api.put('/amount-stock-by-article', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], ArticleStockController.updateStockByArticle);
api.delete('/article-stock', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], ArticleStockController.deleteArticleStock);

// V2
api.get('/v2/article-stocks', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], ArticleStockController.getArticleStocksV2);

module.exports = api;