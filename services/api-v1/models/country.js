'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const StateSchema = new Schema({
	code: { type: String, trim: true },
	name: { type: String, trim: true },
	callingCodes: { type: String, trim: true },
	timezones: { type: String, trim: true },
	flag: { type: String, trim: true },
	alpha2Code: { type: String, trim: true },
	alpha3Code: { type: String, trim: true },
	creationUser: { type: Schema.ObjectId, ref: 'user' },
	creationDate: { type: Date },
	operationType: { type: String, trim: true },
	updateUser: { type: Schema.ObjectId, ref: 'user' },
	updateDate: { type: Date }
});

module.exports = StateSchema;