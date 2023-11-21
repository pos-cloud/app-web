'use strict'

var express = require('express');
var TableController = require('./../controllers/table.controller');
var api = express.Router();
var mdAuth = require('./../middlewares/auth.middleware');
var mdCheckLicense = require('./../middlewares/license.middleware');

// V1
api.get('/table', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], TableController.getTable);
api.get('/tables', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], TableController.getTables);
api.post('/table', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], TableController.saveTable);
api.put('/table', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], TableController.updateTable);
api.delete('/table', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], TableController.deleteTable);

// V2
api.get('/v2/tables', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], TableController.getTablesV2);

module.exports = api;