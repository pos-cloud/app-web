'use strict'

var express = require('express');
var ImportController = require('./../controllers/import.controller');
var importMovement = require('./../controllers/importMovement.controller');
var api = express.Router();
var mdAuth = require('./../middlewares/auth.middleware');
var mdCheckLicense = require('./../middlewares/license.middleware');

api.post('/import-xlsx', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], ImportController.importXlsx);
api.post('/import-movement', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], importMovement.importMovement);

module.exports = api;