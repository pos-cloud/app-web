'use strict'

var express = require('express');
var ClassificationController = require('../controllers/classification.controller');
var api = express.Router();
var mdAuth = require('../middlewares/auth.middleware');
var mdCheckLicense = require('../middlewares/license.middleware');

api.get('/classification', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], ClassificationController.getClassification);
api.get('/classifications', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], ClassificationController.getClassifications);
api.post('/classification', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], ClassificationController.saveClassification);
api.put('/classification', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], ClassificationController.updateClassification);
api.delete('/classification', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], ClassificationController.deleteClassification);

module.exports = api;