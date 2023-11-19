'use strict'

var express = require('express');
var UnitOfMeasurementController = require('./../controllers/unit-of-measurement.controller');
var api = express.Router();
var mdAuth = require('./../middlewares/auth.middleware');
var mdCheckLicense = require('./../middlewares/license.middleware');

// V1
api.get('/unit-of-measurement', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], UnitOfMeasurementController.getUnitOfMeasurement);
api.get('/units-of-measurement', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], UnitOfMeasurementController.getUnitsOfMeasurement);
api.post('/unit-of-measurement', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], UnitOfMeasurementController.saveUnitOfMeasurement);
api.put('/unit-of-measurement', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], UnitOfMeasurementController.updateUnitOfMeasurement);
api.delete('/unit-of-measurement', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], UnitOfMeasurementController.deleteUnitOfMeasurement);

// V2
api.get('/v2/units-of-measurement', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], UnitOfMeasurementController.getUnitsOfMeasurementV2);

module.exports = api;