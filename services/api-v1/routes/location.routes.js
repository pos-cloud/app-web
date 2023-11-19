'use strict'

var express = require('express');
var LocationController = require('./../controllers/location.controller');
var api = express.Router();
var mdAuth = require('./../middlewares/auth.middleware');
var mdCheckLicense = require('./../middlewares/license.middleware');

// V1
api.get('/location', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], LocationController.getLocation);
api.get('/locations', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], LocationController.getLocations);
api.post('/location', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], LocationController.saveLocation);
api.put('/location', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], LocationController.updateLocation);
api.delete('/location', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], LocationController.deleteLocation);

// V2
api.get('/v2/locations', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], LocationController.getLocationsV2);

module.exports = api;