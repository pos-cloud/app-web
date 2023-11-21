'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var AddressSchema = new Schema({
	type: { type: String, trim: true },
	name: { type: String, trim: true },
	number: { type: String, trim: true },
	floor: { type: String, trim: true },
	flat: { type: String, trim: true },
	postalCode: { type: String, trim: true },
	city: { type: String, trim: true },
	state: { type: String, trim: true },
	country: { type: String, trim: true },
	latitude: { type: String, trim: true },
	longitude: { type: String, trim: true },
	observation: { type: String, trim: true },
	forBilling: { type: Boolean, default: true },
	forShipping: { type: Boolean, default: true },
	company: { type: Schema.ObjectId, ref: 'company' },
	creationUser: { type: Schema.ObjectId, ref: 'user' },
	creationDate: { type: Date },
	operationType: { type: String },
	updateUser: { type: Schema.ObjectId, ref: 'user' },
	updateDate: { type: Date },
});

module.exports = AddressSchema;