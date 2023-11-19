'use strict'

var express = require('express');
var CompanyNewsController = require('./../controllers/company-news.controller');
var api = express.Router();
var mdAuth = require('./../middlewares/auth.middleware');
var mdCheckLicense = require('./../middlewares/license.middleware');

// V1
api.get('/company-news', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], CompanyNewsController.getCompanyNews);
api.get('/news', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], CompanyNewsController.getCompaniesNews);
api.post('/company-news', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], CompanyNewsController.saveCompanyNews);
api.put('/company-news', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], CompanyNewsController.updateCompanyNews);
api.delete('/company-news', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], CompanyNewsController.deleteCompanyNews);

// V2
api.get('/v2/news', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], CompanyNewsController.getCompaniesNewsV2);

module.exports = api;