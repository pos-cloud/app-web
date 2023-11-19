'use strict'

var express = require('express');
var TransportController = require('../controllers/transport.controller');
var api = express.Router();
var mdAuth = require('../middlewares/auth.middleware');
var mdCheckLicense = require('../middlewares/license.middleware');

api.get('/transport', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], TransportController.getTransport);
api.get('/transports', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], TransportController.getTransports);
api.post('/transport', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], TransportController.saveTransport);
api.put('/transport', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], TransportController.updateTransport);
api.delete('/transport', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], TransportController.deleteTransport);

module.exports = api;