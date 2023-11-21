'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CashBoxSchema = new Schema({
	number: { type: Number, default: 0 },
	openingDate: { type: Date },
	closingDate: { type: Date },
	state: { type: String, trim: true },
	employee: { type: Schema.ObjectId, ref: 'employee' },
	type: { type: Schema.ObjectId, ref: 'cash-box-type' },
	creationUser: { type: Schema.ObjectId, ref: 'user' },
	creationDate: { type: Date },
	operationType: { type: String, trim: true },
	updateUser: { type: Schema.ObjectId, ref: 'user' },
	updateDate: { type: Date }
});

module.exports = CashBoxSchema;