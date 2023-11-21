'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const CurrencySchema = new Schema({
	code: { type: String, trim: true, default: '1' },
	sign: { type: String, trim: true, default: '$' },
	name: { type: String, trim: true },
	quotation: { type: Number, default: 1 },
	creationUser: { type: Schema.ObjectId, ref: 'user' },
	creationDate: { type: Date },
	operationType: { type: String, trim: true },
	updateUser: { type: Schema.ObjectId, ref: 'user' },
	updateDate: { type: Date }
});

module.exports = CurrencySchema;

