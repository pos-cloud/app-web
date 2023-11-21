'use strict'

var moment = require('moment');
moment.locale('es');
var express = require('express');
var mdAuth = require('./../middlewares/auth.middleware');
var HistoryController = require('./../controllers/history.controller');
var mdCheckLicense = require('./../middlewares/license.middleware');
var api = express.Router();

api.get('/v2/histories', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], HistoryController.getHModelsV2);


module.exports = api;