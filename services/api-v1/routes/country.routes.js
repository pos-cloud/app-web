'use strict'

var express = require('express');
var CountryController = require('../controllers/country.controller');
var api = express.Router();
var mdAuth = require('../middlewares/auth.middleware');
var mdCheckLicense = require('../middlewares/license.middleware');

api.get('/country', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], CountryController.getCountry);
api.get('/countries', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], CountryController.getCountries);
api.post('/country', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], CountryController.saveCountry);
api.put('/country', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], CountryController.updateCountry);
api.delete('/country', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], CountryController.deleteCountry);

module.exports = api;