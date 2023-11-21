'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CompanyContactSchema = new Schema({
	name: { type: String, trim: true },
	phone: { type: String, trim: true },
	position: { type: String, trim: true },
	company: { type: Schema.ObjectId, ref: 'company' },
	creationUser: { type: Schema.ObjectId, ref: 'user' },
	creationDate: { type: Date },
	operationType: { type: String, trim: true },
	updateUser: { type: Schema.ObjectId, ref: 'user' },
	updateDate: { type: Date }
});

module.exports = CompanyContactSchema;