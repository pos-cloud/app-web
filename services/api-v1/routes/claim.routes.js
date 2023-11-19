'use strict'

var express = require('express');
var ClaimController = require('./../controllers/claim.controller');
var api = express.Router();
var mdAuth = require('./../middlewares/auth.middleware');
var mdCheckLicense = require('./../middlewares/license.middleware');

var multipar = require('connect-multiparty');
var multiparMiddleware = multipar({ uploadDir: '/home/upload/claim/' });

// V1
api.post('/claim', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], ClaimController.saveClaim);
api.post('/upload-file-claim/', multiparMiddleware, ClaimController.uploadFile);
api.delete('/file-claim/:file', ClaimController.deleteFile);
api.get('/file-claim/:file', function (req, res) {
	const file = `/home/upload/claim/` + req.params.file;
	res.download(file);
});

module.exports = api;