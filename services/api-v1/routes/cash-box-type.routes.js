'use strict'

var express = require('express');
var CashBoxTypeController = require('./../controllers/cash-box-type.controller');
var api = express.Router();
var mdAuth = require('./../middlewares/auth.middleware');
var mdCheckLicense = require('./../middlewares/license.middleware');

// V1
api.get('/cash-box-type', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], CashBoxTypeController.getCashBoxType);
api.get('/cash-box-types', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], CashBoxTypeController.getCashBoxTypes);
api.post('/cash-box-type', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], CashBoxTypeController.saveCashBoxType);
api.put('/cash-box-type', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], CashBoxTypeController.updateCashBoxType);
api.delete('/cash-box-type', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], CashBoxTypeController.deleteCashBoxType);

// V2
api.get('/v2/cash-box-types', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], CashBoxTypeController.getCashBoxTypesV2);

module.exports = api;