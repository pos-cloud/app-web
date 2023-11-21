'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ApplicationSchema = new Schema({
	order: { type: Number },
	name: { type: String, trim: true },
	url: { type: String, trim: true },
	type: { type: String, trim: true },
	creationUser: { type: Schema.ObjectId, ref: 'user' },
	creationDate: { type: Date },
	operationType: { type: String },
	updateUser: { type: Schema.ObjectId, ref: 'user' },
	updateDate: { type: Date }
});

module.exports = ApplicationSchema;