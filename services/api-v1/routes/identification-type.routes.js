'use strict'

var express = require('express');
var IdentificationTypeController = require('./../controllers/identification-type.controller');
var api = express.Router();
var mdAuth = require('./../middlewares/auth.middleware');
var mdCheckLicense = require('./../middlewares/license.middleware');

// V1
api.get('/identification-type', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], IdentificationTypeController.getIdentificationType);
api.get('/identification-types', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], IdentificationTypeController.getIdentificationTypes);
api.post('/identification-type', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], IdentificationTypeController.saveIdentificationType);
api.put('/identification-type', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], IdentificationTypeController.updateIdentificationType);
api.delete('/identification-type', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], IdentificationTypeController.deleteIdentificationType);

// V2
api.get('/v2/identification-types', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], IdentificationTypeController.getIdentificationTypesV2);

module.exports = api;