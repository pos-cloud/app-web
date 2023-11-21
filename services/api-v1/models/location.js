'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const LocationSchema = new Schema({
	description: { type: String, trim: true },
	positionX: { type: String, trim: true },
	positionY: { type: String, trim: true },
	positionZ: { type: String, trim: true },
	deposit: { type: Schema.ObjectId, ref: 'deposit' },
	creationUser: { type: Schema.ObjectId, ref: 'user' },
	creationDate: { type: Date },
	operationType: { type: String, trim: true },
	updateUser: { type: Schema.ObjectId, ref: 'user' },
	updateDate: { type: Date }
});

module.exports = LocationSchema;