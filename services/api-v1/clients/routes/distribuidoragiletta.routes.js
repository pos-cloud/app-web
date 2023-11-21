'use strict'

var express = require('express');
var DistribuidoragilettaController = require('./../controllers/distribuidoragiletta.controller');
var api = express.Router();
//var mdAuth = require('./../middlewares/auth.middleware');
//var mdCheckLicense = require('./../middlewares/license.middleware');

// V1
api.post('/distribuidoragiletta/update-article', DistribuidoragilettaController.updateArticle);


module.exports = api;