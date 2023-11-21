'use strict'

var express = require('express');
var AuthController = require('./../controllers/auth.controller');
var api = express.Router();
var mdAuth = require('./../middlewares/auth.middleware');
var mdCheckLicense = require('./../middlewares/license.middleware');

api.post('/login', AuthController.login);
api.get('/logout', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], AuthController.logout);
api.get('/forgot-password', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], AuthController.forgotPassword);
api.get('/reset-password', AuthController.resetPassword);
api.get('/validate-token', AuthController.validateToken);

module.exports = api;