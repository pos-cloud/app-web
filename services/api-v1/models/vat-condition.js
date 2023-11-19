'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var VATConditionSchema = new Schema({
	code: { type: Number, default: 5 },
	description: { type: String, trim: true },
	discriminate: { type: Boolean, default: false },
	observation: { type: String },
	transactionLetter: { type: String, trim: true, default: 'C' },
	creationUser: { type: Schema.ObjectId, ref: 'user' },
	creationDate: { type: Date },
	operationType: { type: String, trim: true },
	updateUser: { type: Schema.ObjectId, ref: 'user' },
	updateDate: { type: Date }
});

module.exports = VATConditionSchema;
