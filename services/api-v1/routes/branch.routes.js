'use strict'

var express = require('express');
var BranchController = require('../controllers/branch.controller');
var api = express.Router();
var mdAuth = require('../middlewares/auth.middleware');
var mdCheckLicense = require('../middlewares/license.middleware');

var multer = require('multer');

var storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, '/home/clients/' + req.session.database + '/images/company/')
	},
	filename: function (req, file, cb) {
		cb(null, req.params.id + '-' + file.originalname.normalize('NFD').replace(/[\u0300-\u036f]/g, ""))
	}
})

var upload = multer({ storage: storage });

api.get('/branch', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], BranchController.getBranch);
api.get('/branches', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], BranchController.getBranches);
api.post('/branch', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], BranchController.saveBranch);
api.put('/branch', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], BranchController.updateBranch);
api.delete('/branch', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], BranchController.deleteBranch);

// IMAGEN
api.get('/get-image-branch/:picture/:database', BranchController.getImage);
api.get('/get-image-base64-branch', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], BranchController.getImageBase64);
api.post('/upload-image-branch/:id', [mdAuth.ensureAuth, mdCheckLicense.ensureLic, upload.single('image')], BranchController.uploadImage);
api.delete('/delete-image-branch', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], BranchController.deleteImage);

module.exports = api;