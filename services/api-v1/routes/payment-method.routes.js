'use strict'

var express = require('express');
var PaymentMethodController = require('./../controllers/payment-method.controller');
var api = express.Router();
var mdAuth = require('./../middlewares/auth.middleware');
var mdCheckLicense = require('./../middlewares/license.middleware');

// V1
api.get('/payment-method', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], PaymentMethodController.getPaymentMethod);
api.get('/payment-methods', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], PaymentMethodController.getPaymentMethods);
api.post('/payment-method', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], PaymentMethodController.savePaymentMethod);
api.put('/payment-method', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], PaymentMethodController.updatePaymentMethod);
api.delete('/payment-method', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], PaymentMethodController.deletePaymentMethod);
api.get('/sales-by-payment-method', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], PaymentMethodController.getSalesByPaymentMethod);

// V2
api.get('/v2/payment-methods', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], PaymentMethodController.getPaymentMethodsV2);

module.exports = api;