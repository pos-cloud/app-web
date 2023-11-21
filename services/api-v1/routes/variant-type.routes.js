'use strict'

var express = require('express');
var VariantTypeController = require('./../controllers/variant-type.controller');
var api = express.Router();
var mdAuth = require('./../middlewares/auth.middleware');
var mdCheckLicense = require('./../middlewares/license.middleware');

// V1
api.get('/variant-type', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], VariantTypeController.getVariantType);
api.get('/variant-types', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], VariantTypeController.getVariantTypes);
api.post('/variant-type', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], VariantTypeController.saveVariantType);
api.put('/variant-type', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], VariantTypeController.updateVariantType);
api.delete('/variant-type', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], VariantTypeController.deleteVariantType);

// V2
api.get('/v2/variant-types', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], VariantTypeController.getVariantTypesV2);

module.exports = api;