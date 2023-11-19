'use strict'

var express = require('express');
var PriceListController = require('./../controllers/price-list.controller');
var api = express.Router();
var mdAuth = require('./../middlewares/auth.middleware');
var mdCheckLicense = require('./../middlewares/license.middleware');

// V1
api.get('/price-list', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], PriceListController.getPriceList);
api.get('/price-lists', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], PriceListController.getPriceLists);
api.post('/price-list', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], PriceListController.savePriceList);
api.put('/price-list', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], PriceListController.updatePriceList);
api.delete('/price-list', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], PriceListController.deletePriceList);

// V2
api.get('/v2/price-lists', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], PriceListController.getPriceListsV2);

module.exports = api;