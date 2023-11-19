'use strict'

var express = require('express');
var VariantController = require('./../controllers/variant.controller');
var api = express.Router();
var mdAuth = require('./../middlewares/auth.middleware');
var mdCheckLicense = require('./../middlewares/license.middleware');

// V1
api.get('/variant', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], VariantController.getVariant);
api.get('/variants', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], VariantController.getVariants);
api.post('/variant', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], VariantController.saveVariant);
api.put('/variant', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], VariantController.updateVariant);
api.delete('/variant', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], VariantController.deleteVariant);

// V2
api.get('/v2/variants', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], VariantController.getVariantsV2);

module.exports = api;