'use strict'

var express = require('express');
var EmailTemplateController = require('./../controllers/email-template.controller');
var api = express.Router();
var mdAuth = require('./../middlewares/auth.middleware');
var mdCheckLicense = require('./../middlewares/license.middleware');

api.get('/email-templates', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], EmailTemplateController.getEmailTemplates);
api.post('/email-template', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], EmailTemplateController.saveEmailTemplate);
api.put('/email-template', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], EmailTemplateController.updateEmailTemplate);
api.delete('/email-template', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], EmailTemplateController.deleteEmailTemplate);

module.exports = api;