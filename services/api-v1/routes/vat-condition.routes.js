'use strict'

var express = require('express');
var VATConditionController = require('./../controllers/vat-condition.controller');
var api = express.Router();
var mdAuth = require('./../middlewares/auth.middleware');
var mdCheckLicense = require('./../middlewares/license.middleware');

// V1
api.get('/vat-condition', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], VATConditionController.getVATCondition);
api.get('/vat-conditions', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], VATConditionController.getVATConditions);
api.post('/vat-condition', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], VATConditionController.saveVATCondition);
api.put('/vat-condition', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], VATConditionController.updateVATCondition);
api.delete('/vat-condition', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], VATConditionController.deleteVATCondition);

// V2
api.get('/v2/vat-conditions', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], VATConditionController.getVATConditionsV2);

module.exports = api;