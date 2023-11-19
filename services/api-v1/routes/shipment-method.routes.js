'use strict'

var express = require('express');
var ShipmentMethodController = require('../controllers/shipment-method.controller');
var api = express.Router();
var mdAuth = require('../middlewares/auth.middleware');
var mdCheckLicense = require('../middlewares/license.middleware');

api.get('/shipment-method', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], ShipmentMethodController.getShipmentMethod);
api.get('/shipment-methods', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], ShipmentMethodController.getShipmentMethods);
api.post('/shipment-method', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], ShipmentMethodController.saveShipmentMethod);
api.put('/shipment-method', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], ShipmentMethodController.updateShipmentMethod);
api.delete('/shipment-method', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], ShipmentMethodController.deleteShipmentMethod);

module.exports = api;