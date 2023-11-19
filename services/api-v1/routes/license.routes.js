'use strict'

var express = require('express');
var LicenseController = require('./../controllers/license.controller');
var jwt = require('./../services/jwt.services');
var api = express.Router();
var mdAuth = require('./../middlewares/auth.middleware');
var mdCheckLicense = require('./../middlewares/license.middleware');

api.get('/download-license', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], LicenseController.ftpConnection);
api.get('/generar-licencia/:params', jwt.generateTokenLicense);
api.get('/generar-licencia-payment', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], LicenseController.generateLicensePayment);

module.exports = api;