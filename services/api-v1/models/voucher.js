'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const VoucherSchema = new Schema({
	date: { type: Date },
	token: { type: String, trim: true },
	readings: { type: Number, default: 0 },
	expirationDate: { type: Date },
	creationUser: { type: Schema.ObjectId, ref: 'user' },
	creationDate: { type: Date },
	operationType: { type: String, trim: true },
	updateUser: { type: Schema.ObjectId, ref: 'user' },
	updateDate: { type: Date }
});

module.exports = VoucherSchema;

