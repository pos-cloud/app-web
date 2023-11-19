'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var TransportSchema = new Schema({
	code: { type: Number, default: 0 },
	name: { type: String, trim: true },
	fantasyName: { type: String, trim: true },
	vatCondition: { type: Schema.ObjectId, ref: 'vat-condition' },
	identificationType: { type: Schema.ObjectId, ref: 'identification-type' },
	identificationValue: { type: String, trim: true },
	grossIncome: { type: String, trim: true },
	address: { type: String, trim: true },
	city: { type: String, trim: true },
	phones: { type: String, trim: true },
	emails: { type: String, trim: true },
	observation: { type: String, trim: true },
	country: { type: Schema.ObjectId, ref: 'country' },
	floorNumber: { type: String, trim: true },
	state: { type: Schema.ObjectId, ref: 'state' },
	addressNumber: { type: String, trim: true },
	creationUser: { type: Schema.ObjectId, ref: 'user' },
	creationDate: { type: Date },
	operationType: { type: String, trim: true },
	updateUser: { type: Schema.ObjectId, ref: 'user' },
	updateDate: { type: Date },
});

module.exports = TransportSchema;