'use strict'

var express = require('express');
var TransactionController = require('./../controllers/transaction.controller');
var api = express.Router();
var mdAuth = require('./../middlewares/auth.middleware');
var mdCheckLicense = require('./../middlewares/license.middleware');

// V1
api.get('/transaction', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], TransactionController.getTransaction);
api.get('/transactions', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], TransactionController.getTransactions);
api.get('/transactions-by-movement/:movement', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], TransactionController.getTransactionsByMovement);
api.get('/transactions-by-movement/:movement', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], TransactionController.getTransactionsByMovement);
api.get('/shift-closing-by-transaction', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], TransactionController.getShiftClosing);
api.get('/total-transactions', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], TransactionController.getTotalTransactionsBetweenDates);
api.get('/get-vat-book', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], TransactionController.getVATBook);
api.post('/transaction', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], TransactionController.saveTransaction);
api.put('/transaction', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], TransactionController.updateTransaction);
api.delete('/transaction', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], TransactionController.deleteTransaction);
api.put('/update-balance', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], TransactionController.updateBalance);

// V2
api.get('/v2/transactions', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], TransactionController.getTransactionsV2);
api.post('/v3/transactions', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], TransactionController.getTransactionsV3);

module.exports = api;