'use strict'

var express = require('express');
var TaxController = require('./../controllers/tax.controller');
var api = express.Router();
var mdAuth = require('./../middlewares/auth.middleware');
var mdCheckLicense = require('./../middlewares/license.middleware');

// V1
api.get('/tax', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], TaxController.getTax);
api.get('/taxes', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], TaxController.getTaxes);
api.post('/tax', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], TaxController.saveTax);
api.put('/tax', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], TaxController.updateTax);
api.delete('/tax', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], TaxController.deleteTax);

// V2
api.get('/v2/taxes', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], TaxController.getTaxesV2);

module.exports = api;