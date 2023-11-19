'use strict'

var express = require('express');
var OriginController = require('../controllers/origin.controller');
var api = express.Router();
var mdAuth = require('../middlewares/auth.middleware');
var mdCheckLicense = require('../middlewares/license.middleware');

api.get('/origin', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], OriginController.getOrigin);
api.get('/origins', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], OriginController.getOrigins);
api.post('/origin', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], OriginController.saveOrigin);
api.put('/origin', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], OriginController.updateOrigin);
api.delete('/origin', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], OriginController.deleteOrigin);

module.exports = api;