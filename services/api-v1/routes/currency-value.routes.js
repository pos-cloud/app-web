'use strict'

var express = require('express');
var CurrencyValueController = require('./../controllers/currency-value.controller');
var api = express.Router();
var mdAuth = require('./../middlewares/auth.middleware');
var mdCheckLicense = require('./../middlewares/license.middleware');

// V1
api.get('/currency-value', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], CurrencyValueController.getCurrencyValue);
api.get('/currency-values', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], CurrencyValueController.getCurrencyValues);
api.post('/currency-value', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], CurrencyValueController.saveCurrencyValue);
api.put('/currency-value', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], CurrencyValueController.updateCurrencyValue);
api.delete('/currency-value', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], CurrencyValueController.deleteCurrencyValue);

// V2
api.get('/v2/currency-values', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], CurrencyValueController.getCurrencyValuesV2);

module.exports = api;