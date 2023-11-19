'use strict'

var express = require('express');
var ApplicationController = require('./../controllers/application.controller');
var api = express.Router();
var mdAuth = require('./../middlewares/auth.middleware');
var mdCheckLicense = require('./../middlewares/license.middleware');

api.get('/application', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], ApplicationController.getApplication);
api.get('/applications', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], ApplicationController.getApplications);
api.post('/application', [mdAuth.ensureAuth, mdCheckLicense.ensureLic],ApplicationController.saveApplication);
api.put('/application', [mdAuth.ensureAuth, mdCheckLicense.ensureLic],ApplicationController.updateApplication);
api.delete('/application', [mdAuth.ensureAuth, mdCheckLicense.ensureLic],ApplicationController.deleteApplication);

module.exports = api;