'use strict'

var express = require('express');
var CashBoxController = require('./../controllers/cash-box.controller');
var api = express.Router();
var mdAuth = require('./../middlewares/auth.middleware');
var mdCheckLicense = require('./../middlewares/license.middleware');

// V1
api.get('/cash-box', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], CashBoxController.getCashBox);
api.get('/cash-boxes', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], CashBoxController.getCashBoxes);
api.post('/cash-box', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], CashBoxController.saveCashBox);
api.put('/cash-box', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], CashBoxController.updateCashBox);
api.delete('/cash-box', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], CashBoxController.deleteCashBox);
api.get('/get-closing-cash-box', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], CashBoxController.getClosingCashBox);

// V2
api.get('/v2/cash-boxes', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], CashBoxController.getCashBoxesV2);

module.exports = api;