'use strict'

var express = require('express');
var VoucherController = require('./../controllers/voucher.controller');
var api = express.Router();
var mdAuth = require('./../middlewares/auth.middleware');
var mdCheckLicense = require('./../middlewares/license.middleware');

// V1
api.get('/voucher', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], VoucherController.getVoucher);
api.get('/vouchers', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], VoucherController.getVouchers);
api.post('/voucher', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], VoucherController.saveVoucher);
api.put('/voucher', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], VoucherController.updateVoucher);
api.delete('/voucher', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], VoucherController.deleteVoucher);
api.post('/generate-voucher', VoucherController.generateVoucher);
api.post('/verify-voucher', VoucherController.verifyVoucher);

// V2
api.get('/v2/vouchers', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], VoucherController.getVouchersV2);

module.exports = api;