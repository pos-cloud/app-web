'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ReservationSchema = new Schema({
	title: { type: String, trim: true },
	message: { type: String, trim: true },
	devolution: { type: String, trim: true },
	startDate: { type: Date },
	endDate: { type: Date },
	state: { type: String, trim: true },
	fixed: { type: Boolean, default: false },
	allDay: { type: Boolean, default: false },
	creationUser: { type: Schema.ObjectId, ref: 'user' },
	creationDate: { type: Date },
	operationType: { type: String, trim: true },
	updateUser: { type: Schema.ObjectId, ref: 'user' },
	updateDate: { type: Date }
});

module.exports = ReservationSchema;