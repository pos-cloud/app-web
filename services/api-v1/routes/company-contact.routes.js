'use strict'

var express = require('express');
var CompanyContactController = require('../controllers/company-contact.controller');
var api = express.Router();
var mdAuth = require('../middlewares/auth.middleware');
var mdCheckLicense = require('../middlewares/license.middleware');

// V1
api.get('/company-contact', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], CompanyContactController.getCompanyContact);
api.get('/contacts', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], CompanyContactController.getCompaniesContacts);
api.post('/company-contact', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], CompanyContactController.saveCompanyContact);
api.put('/company-contact', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], CompanyContactController.updateCompanyContact);
api.delete('/company-contact', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], CompanyContactController.deleteCompanyContact);

// V2
api.get('/v2/contacts', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], CompanyContactController.getCompaniesContactsV2);

module.exports = api;