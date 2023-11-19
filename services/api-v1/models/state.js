'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const StateSchema = new Schema({
	code: { type: String, trim: true },
	name: { type: String, trim: true },
	country: { type: Schema.ObjectId, ref: 'country' },
	creationUser: { type: Schema.ObjectId, ref: 'user' },
	creationDate: { type: Date },
	operationType: { type: String, trim: true },
	updateUser: { type: Schema.ObjectId, ref: 'user' },
	updateDate: { type: Date }
});

module.exports = StateSchema;

