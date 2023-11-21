'use strict'

var express = require('express');
var UseOfCFDIController = require('./../controllers/use-of-CFDI.controller');
var api = express.Router();
var mdAuth = require('./../middlewares/auth.middleware');
var mdCheckLicense = require('./../middlewares/license.middleware');

// V1
api.get('/use-of-cfdi', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], UseOfCFDIController.getUseOfCFDI);
api.get('/uses-of-cfdi', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], UseOfCFDIController.getUsesOfCFDI);
api.post('/use-of-cfdi', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], UseOfCFDIController.saveUseOfCFDI);
api.put('/use-of-cfdi', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], UseOfCFDIController.updateUseOfCFDI);
api.delete('/use-of-cfdi', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], UseOfCFDIController.deleteUseOfCFDI);

// V2
api.get('/v2/uses-of-cfdi', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], UseOfCFDIController.getUsesOfCFDIV2);

module.exports = api;