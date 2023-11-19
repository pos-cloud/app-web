'use strict'

var express = require('express');
var RelationTypeController = require('./../controllers/relation-type.controller');
var api = express.Router();
var mdAuth = require('./../middlewares/auth.middleware');
var mdCheckLicense = require('./../middlewares/license.middleware');

// V1
api.get('/relation-type', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], RelationTypeController.getRelationType);
api.get('/relation-types', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], RelationTypeController.getRelationTypes);
api.post('/relation-type', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], RelationTypeController.saveRelationType);
api.put('/relation-type', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], RelationTypeController.updateRelationType);
api.delete('/relation-type', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], RelationTypeController.deleteRelationType);

// V2
api.get('/v2/relation-types', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], RelationTypeController.getRelationTypesV2);

module.exports = api;