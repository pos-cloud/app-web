'use strict'

var express = require('express');
var CompanyFieldController = require('./../controllers/company-field.controller');
var api = express.Router();
var mdAuth = require('./../middlewares/auth.middleware');
var mdCheckLicense = require('./../middlewares/license.middleware');

// V1
api.get('/company-field', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], CompanyFieldController.getCompanyField);
api.get('/company-fields', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], CompanyFieldController.getCompanyFields);
api.post('/company-field', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], CompanyFieldController.saveCompanyField);
api.put('/company-field', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], CompanyFieldController.updateCompanyField);
api.delete('/company-field', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], CompanyFieldController.deleteCompanyField);

// V2
api.get('/v2/company-fields', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], CompanyFieldController.getCompanyFieldsV2);

module.exports = api;