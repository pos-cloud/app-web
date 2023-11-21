'use strict'

var express = require('express');
var MercadopagoController = require('./../controllers/mercadopago.controller');
var api = express.Router();
var mdAuth = require('./../middlewares/auth.middleware');
var mdCheckLicense = require('./../middlewares/license.middleware');

api.post('/mercadopago/generate-payment-link', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], MercadopagoController.generatePaymentLink);
api.get('/mercadopago/search-payment/:externalreference', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], MercadopagoController.searchPayment);
api.post('/mercadopago/verify-payments-by-client', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], MercadopagoController.verifyPaymentsByClient);

module.exports = api;