'use strict'

var express = require('express');
var VariantValueController = require('./../controllers/variant-value.controller');
var api = express.Router();
var mdAuth = require('./../middlewares/auth.middleware');
var mdCheckLicense = require('./../middlewares/license.middleware');

// V1
api.get('/variant-value', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], VariantValueController.getVariantValue);
api.get('/variant-values', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], VariantValueController.getVariantValues);
api.post('/variant-value', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], VariantValueController.saveVariantValue);
api.put('/variant-value', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], VariantValueController.updateVariantValue);
api.delete('/variant-value', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], VariantValueController.deleteVariantValue);

// V2
api.get('/v2/variant-values', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], VariantValueController.getVariantValuesV2);

module.exports = api;