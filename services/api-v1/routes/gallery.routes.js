'use strict'

var express = require('express');
var GalleryController = require('./../controllers/gallery.controller');
var api = express.Router();
var mdAuth = require('./../middlewares/auth.middleware');
var mdCheckLicense = require('./../middlewares/license.middleware');

// V1
api.get('/gallery', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], GalleryController.getGallery);
api.get('/galleries', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], GalleryController.getGalleries);
api.post('/gallery', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], GalleryController.saveGallery);
api.put('/gallery', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], GalleryController.updateGallery);
api.delete('/gallery', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], GalleryController.deleteGallery);

// V2
api.get('/v2/galleries', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], GalleryController.getGalleriesV2);

module.exports = api;