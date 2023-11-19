'use strict'

var express = require('express');
var BankController = require('../controllers/bank.controller');
var api = express.Router();
var mdAuth = require('../middlewares/auth.middleware');
var mdCheckLicense = require('../middlewares/license.middleware');

api.get('/bank', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], BankController.getBank);
api.get('/banks', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], BankController.getBanks);
api.post('/bank', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], BankController.saveBank);
api.put('/bank', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], BankController.updateBank);
api.delete('/bank', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], BankController.deleteBank);

module.exports = api;