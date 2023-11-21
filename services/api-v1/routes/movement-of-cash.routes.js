'use strict'

var express = require('express');
var MovementOfCashController = require('./../controllers/movement-of-cash.controller');
var api = express.Router();
var mdAuth = require('./../middlewares/auth.middleware');
var mdCheckLicense = require('./../middlewares/license.middleware');

// V1
api.get('/movement-of-cash', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], MovementOfCashController.getMovementOfCash);
api.get('/movements-of-cashes', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], MovementOfCashController.getMovementsOfCashes);
api.get('/movements-of-cashes-by-transaction-movement', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], MovementOfCashController.getMovementsOfCashesByTransactionMovement);
api.get('/movements-of-cashes-by-company/:company', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], MovementOfCashController.getMovementsOfCashesByCompany);
api.get('/shift-closing-by-payment-method', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], MovementOfCashController.getShiftClosing);
api.post('/movement-of-cash', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], MovementOfCashController.saveMovementOfCash);
api.post('/movements-of-cashes', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], MovementOfCashController.saveMovementsOfCashes);
api.put('/movement-of-cash', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], MovementOfCashController.updateMovementOfCash);
api.delete('/movement-of-cash', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], MovementOfCashController.deleteMovementOfCash);
api.delete('/movements-of-cashes', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], MovementOfCashController.deleteMovementsOfCashes);

// V2
api.get('/v2/movements-of-cashes', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], MovementOfCashController.getMovementsOfCashesV2);
api.post('/v3/movements-of-cashes', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], MovementOfCashController.getMovementsOfCashesV3);

module.exports = api;