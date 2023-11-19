'use strict'

var express = require('express');
var CompanyGroupController = require('../controllers/company-group.controller');
var api = express.Router();
var mdAuth = require('../middlewares/auth.middleware');
var mdCheckLicense = require('../middlewares/license.middleware');

// V1
api.get('/group', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], CompanyGroupController.getCompanyGroup);
api.get('/groups', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], CompanyGroupController.getCompaniesGroups);
api.post('/group', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], CompanyGroupController.saveCompanyGroup);
api.put('/group', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], CompanyGroupController.updateCompanyGroup);
api.delete('/group', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], CompanyGroupController.deleteCompanyGroup);

// V2
api.get('/v2/groups', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], CompanyGroupController.getCompaniesGroupsV2);

module.exports = api;