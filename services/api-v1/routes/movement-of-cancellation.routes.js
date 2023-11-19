'use strict'

var express = require('express');
var MovementOfCancellationController = require('../controllers/movement-of-cancellation.controller');
var api = express.Router();
var mdAuth = require('./../middlewares/auth.middleware');
var mdCheckLicense = require('./../middlewares/license.middleware');

api.get('/movement-of-cancellation', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], MovementOfCancellationController.getMovementOfCancellation);
api.get('/movements-of-cancellations', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], MovementOfCancellationController.getMovementsOfCancellations);
api.post('/movement-of-cancellation', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], MovementOfCancellationController.saveMovementOfCancellation);
api.post('/movements-of-cancellations', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], MovementOfCancellationController.saveMovementsOfCancellations);
api.put('/movement-of-cancellation', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], MovementOfCancellationController.updateMovementOfCancellation);
api.delete('/movement-of-cancellation', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], MovementOfCancellationController.deleteMovementOfCancellation);
api.delete('/movements-of-cancellations', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], MovementOfCancellationController.deleteMovementsOfCancellations);

module.exports = api;