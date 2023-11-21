'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var EmailTemplateSchema = new Schema({
	name: { type: String, trim: true },
	design : { type: String },
	creationUser: { type: Schema.ObjectId, ref: 'user' },
	creationDate: { type: Date },
	operationType: { type: String, trim: true },
	updateUser: { type: Schema.ObjectId, ref: 'user' },
	updateDate: { type: Date }
});

module.exports = EmailTemplateSchema;