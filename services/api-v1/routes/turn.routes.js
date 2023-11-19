'use strict'

var express = require('express');
var TurnController = require('./../controllers/turn.controller');
var api = express.Router();
var mdAuth = require('./../middlewares/auth.middleware');
var mdCheckLicense = require('./../middlewares/license.middleware');

// V1
api.get('/turn', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], TurnController.getTurn);
api.get('/turns', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], TurnController.getTurns);
api.post('/turn', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], TurnController.saveTurn);
api.put('/turn', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], TurnController.updateTurn);
api.delete('/turn', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], TurnController.deleteTurn);

// V2
api.get('/v2/turns', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], TurnController.getTurnsV2);

module.exports = api;