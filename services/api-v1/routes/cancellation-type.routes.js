'use strict'

var express = require('express');
var CancellationTypeController = require('../controllers/cancellation-type.controller');
var api = express.Router();
var mdAuth = require('../middlewares/auth.middleware');
var mdCheckLicense = require('../middlewares/license.middleware');

api.get('/cancellation-type', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], CancellationTypeController.getCancellationType);
api.get('/cancellation-types', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], CancellationTypeController.getCancellationTypes);
api.post('/cancellation-type', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], CancellationTypeController.saveCancellationType);
api.put('/cancellation-type', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], CancellationTypeController.updateCancellationType);
api.delete('/cancellation-type', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], CancellationTypeController.deleteCancellationType);

module.exports = api;