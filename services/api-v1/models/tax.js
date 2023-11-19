'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var TaxSchema = new Schema({
	code: { type: String, trim: true, default: "0" },
	name: { type: String, trim: true },
	taxBase: { type: String, trim: true },
	percentage: { type: Number, default: 0 },
	amount: { type: Number, default: 0 },
	classification: { type: String, trim: true },
	type: { type: String, trim: true },
	lastNumber: { type: Number, default: 0 },
    debitAccount : { type: Schema.ObjectId, ref: 'account' },
    creditAccount : { type: Schema.ObjectId, ref: 'account' },
    printer : { type: Schema.ObjectId, ref: 'printer' },
    creationUser: { type: Schema.ObjectId, ref: 'user' },
	creationDate: { type: Date },
	operationType: { type: String, trim: true },
	updateUser: { type: Schema.ObjectId, ref: 'user' },
	updateDate: { type: Date }
});

module.exports = TaxSchema;