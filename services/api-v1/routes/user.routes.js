'use strict'

var express = require('express');
var UserController = require('./../controllers/user.controller');
var api = express.Router();
var mdAuth = require('./../middlewares/auth.middleware');
var mdCheckLicense = require('./../middlewares/license.middleware');

// V1
api.get('/user', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], UserController.getUser);
api.get('/users', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], UserController.getUsers);
api.post('/user', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], UserController.saveUser);
api.put('/user', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], UserController.updateUser);
api.delete('/user', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], UserController.deleteUser);

// V2
api.get('/v2/users', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], UserController.getUsersV2);

module.exports = api;