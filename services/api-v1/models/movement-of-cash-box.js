'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var MovementOfCashBoxSchema = new Schema({
	opening: { type: Date },
	closing: { type: Date },
	paymentMethod: { type: Schema.ObjectId, ref: 'payment-method' },
	cashBox: { type: Schema.ObjectId, ref: 'cash-box' },
	creationUser: { type: Schema.ObjectId, ref: 'user' },
	creationDate: { type: Date },
	operationType: { type: String, trim: true },
	updateUser: { type: Schema.ObjectId, ref: 'user' },
	updateDate: { type: Date }
});

module.exports = MovementOfCashBoxSchema;