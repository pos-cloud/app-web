'use strict'

var express = require('express');
var StructureController = require('../controllers/structure.controller');
var api = express.Router();
var mdAuth = require('./../middlewares/auth.middleware');
var mdCheckLicense = require('./../middlewares/license.middleware');

api.get('/structure', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], StructureController.getStructure);
api.get('/structures', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], StructureController.getStructures);
api.post('/structure', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], StructureController.saveStructure);
api.put('/structure', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], StructureController.updateStructure);
api.delete('/structure', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], StructureController.deleteStructure);

module.exports = api;