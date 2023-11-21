'use strict'

var express = require('express');
var AddressController = require('../controllers/address.controller');
var api = express.Router();
var mdAuth = require('../middlewares/auth.middleware');
var mdCheckLicense = require('../middlewares/license.middleware');

api.get('/address', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], AddressController.getAddress);
api.get('/addresses', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], AddressController.getAddresses);
api.post('/address', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], AddressController.saveAddress);
api.put('/address', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], AddressController.updateAddress);
api.delete('/address', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], AddressController.deleteAddress);

module.exports = api;