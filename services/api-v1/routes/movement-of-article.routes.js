'use strict'

var express = require('express');
var MovementOfArticleController = require('./../controllers/movement-of-article.controller');
var api = express.Router();
var mdAuth = require('./../middlewares/auth.middleware');
var mdCheckLicense = require('./../middlewares/license.middleware');

api.get('/movement-of-article', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], MovementOfArticleController.getMovementOfArticle);
api.get('/movements-of-articles', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], MovementOfArticleController.getMovementsOfArticles);
api.get('/shift-closing-by-article/:turn', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], MovementOfArticleController.getShiftClosing);
api.post('/movement-of-article', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], MovementOfArticleController.saveMovementOfArticle);
api.post('/movements-of-articles', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], MovementOfArticleController.saveMovementsOfArticles);
api.put('/movement-of-article', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], MovementOfArticleController.updateMovementOfArticle);
api.put('/movement-of-article-by-where', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], MovementOfArticleController.updateMovementOfArticleByWhere);
api.put('/movements-of-articles-by-where', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], MovementOfArticleController.updateMovementsOfArticlesByWhere);
api.delete('/movement-of-article', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], MovementOfArticleController.deleteMovementOfArticle);
api.delete('/movements-of-articles', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], MovementOfArticleController.deleteMovementsOfArticles);

// V2
api.get('/v2/movements-of-articles', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], MovementOfArticleController.getMovementsOfArticlesV2);
api.post('/v3/movements-of-articles', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], MovementOfArticleController.getMovementsOfArticlesV3);

module.exports = api;