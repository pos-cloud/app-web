'use strict'

var express = require('express');
var RegisterController = require('./../controllers/register.controller');
var api = express.Router();

api.post('/register', RegisterController.register);

module.exports = api;