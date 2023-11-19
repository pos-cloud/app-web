'use strict'

var express = require('express');
var StateController = require('../controllers/state.controller');
var api = express.Router();
var mdAuth = require('../middlewares/auth.middleware');
var mdCheckLicense = require('../middlewares/license.middleware');

api.get('/state', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], StateController.getState);
api.get('/states', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], StateController.getStates);
api.post('/state', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], StateController.saveState);
api.put('/state', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], StateController.updateState);
api.delete('/state', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], StateController.deleteState);

module.exports = api;