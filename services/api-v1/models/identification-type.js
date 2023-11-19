'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const IdentificationTypeSchema = new Schema({
	code: { type: String, trim: true, default: '1' },
	name: { type: String, trim: true },
	creationUser: { type: Schema.ObjectId, ref: 'user' },
	creationDate: { type: Date },
	operationType: { type: String, trim: true },
	updateUser: { type: Schema.ObjectId, ref: 'user' },
	updateDate: { type: Date }
});

module.exports = IdentificationTypeSchema;

