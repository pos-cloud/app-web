'use strict'

var express = require('express');
var DepositController = require('./../controllers/deposit.controller');
var api = express.Router();
var mdAuth = require('./../middlewares/auth.middleware');
var mdCheckLicense = require('./../middlewares/license.middleware');

// V1
api.get('/deposit', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], DepositController.getDeposit);
api.get('/deposits', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], DepositController.getDeposits);
api.post('/deposit', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], DepositController.saveDeposit);
api.put('/deposit', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], DepositController.updateDeposit);
api.delete('/deposit', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], DepositController.deleteDeposit);

// V2
api.get('/v2/deposits', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], DepositController.getDepositsV2);

module.exports = api;