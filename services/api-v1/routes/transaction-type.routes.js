'use strict'

var express = require('express');
var TransactionTypeController = require('./../controllers/transaction-type.controller');
var api = express.Router();
var mdAuth = require('./../middlewares/auth.middleware');
var mdCheckLicense = require('./../middlewares/license.middleware');

// V1
api.get('/transaction-type', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], TransactionTypeController.getTransactionType);
api.get('/transaction-types', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], TransactionTypeController.getTransactionTypes);
api.post('/transaction-type', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], TransactionTypeController.saveTransactionType);
api.put('/transaction-type', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], TransactionTypeController.updateTransactionType);
api.delete('/transaction-type', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], TransactionTypeController.deleteTransactionType);

// V2
api.get('/v2/transaction-types', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], TransactionTypeController.getTransactionTypesV2);

module.exports = api;