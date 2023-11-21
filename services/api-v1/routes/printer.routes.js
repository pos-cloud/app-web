'use strict'

var express = require('express');
var PrinterController = require('./../controllers/printer.controller');
var api = express.Router();
var mdAuth = require('./../middlewares/auth.middleware');
var mdCheckLicense = require('./../middlewares/license.middleware');

// V1
api.get('/printer', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], PrinterController.getPrinter);
api.get('/printers', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], PrinterController.getPrinters);
api.post('/printer', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], PrinterController.savePrinter);
api.put('/printer', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], PrinterController.updatePrinter);
api.delete('/printer', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], PrinterController.deletePrinter);

// V2
api.get('/v2/printers', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], PrinterController.getPrintersV2);

module.exports = api;