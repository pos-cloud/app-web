'use strict'

var express = require('express');
var EmailController = require('./../controllers/email.controller');
var api = express.Router();
var mdAuth = require('./../middlewares/auth.middleware');
var mdCheckLicense = require('./../middlewares/license.middleware');

api.post('/send-email-client', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], EmailController.sendEmailClient);
api.post('/send-email-to-client', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], EmailController.sendEmailToClient)
api.post('/contact-me', EmailController.contactMe)

module.exports = api;