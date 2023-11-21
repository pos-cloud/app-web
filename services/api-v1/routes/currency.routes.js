'use strict'

var express = require('express');
var CurrencyController = require('./../controllers/currency.controller');
var api = express.Router();
var mdAuth = require('./../middlewares/auth.middleware');
var mdCheckLicense = require('./../middlewares/license.middleware');

// V1
api.get('/currency', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], CurrencyController.getCurrency);
api.get('/currencies', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], CurrencyController.getCurrencies);
api.post('/currency', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], CurrencyController.saveCurrency);
api.put('/currency', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], CurrencyController.updateCurrency);
api.delete('/currency', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], CurrencyController.deleteCurrency);

// V2
api.get('/v2/currencies', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], CurrencyController.getCurrenciesV2);

module.exports = api;