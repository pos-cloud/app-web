'use strict'

var express = require('express');
var RoomController = require('./../controllers/room.controller');
var api = express.Router();
var mdAuth = require('./../middlewares/auth.middleware');
var mdCheckLicense = require('./../middlewares/license.middleware');

// V1
api.get('/room', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], RoomController.getRoom);
api.get('/rooms', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], RoomController.getRooms);
api.post('/room', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], RoomController.saveRoom);
api.put('/room', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], RoomController.updateRoom);
api.delete('/room', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], RoomController.deleteRoom);

// V2
api.get('/v2/rooms', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], RoomController.getRoomsV2);

module.exports = api;