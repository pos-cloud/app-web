'use strict'

var express = require('express');
var UtilitiesController = require('./../controllers/utilities.controller');
var api = express.Router();

api.get('/uglify', UtilitiesController.uglify);

module.exports = api;