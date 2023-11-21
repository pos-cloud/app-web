'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CurrencyValueSchema = new Schema({
	name: { type: String, trim: true },
	value: { type: Number },
	creationUser: { type: Schema.ObjectId, ref: 'user' },
	creationDate: { type: Date },
	operationType: { type: String, trim: true },
	updateUser: { type: Schema.ObjectId, ref: 'user' },
	updateDate: { type: Date }
});

module.exports = CurrencyValueSchema;