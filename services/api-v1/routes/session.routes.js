'use strict'

var express = require('express');
var SessionController = require('./../controllers/session.controller');
var api = express.Router();
var mdCheckLicense = require('./../middlewares/license.middleware');

api.get('/session', [mdAuth.ensureAuth, mdCheckLicense.ensureLic],  SessionController.getSesion);
api.get('/sessions', [mdAuth.ensureAuth, mdCheckLicense.ensureLic],  SessionController.getSesions);

module.exports = api;