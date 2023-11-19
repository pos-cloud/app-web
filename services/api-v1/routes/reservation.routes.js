'use strict'

var express = require('express');
var ReservationController = require('./../controllers/reservation.controller');
var api = express.Router();
var mdAuth = require('./../middlewares/auth.middleware');
var mdCheckLicense = require('./../middlewares/license.middleware');

// V1
api.get('/reservation', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], ReservationController.getReservation);
api.get('/reservations', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], ReservationController.getReservations);
api.post('/reservation', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], ReservationController.saveReservation);
api.put('/reservation', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], ReservationController.updateReservation);
api.delete('/reservation', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], ReservationController.deleteReservation);

// V2
api.get('/v2/reservations', [mdAuth.ensureAuth, mdCheckLicense.ensureLic], ReservationController.getReservationsV2);

module.exports = api;