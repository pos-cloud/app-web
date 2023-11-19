'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CompanyNewsSchema = new Schema({
	date: { type: Date },
	news: { type: String, trim: true },
	state: { type: String, trim: true },
	company: { type: Schema.ObjectId, ref: 'company' },
	creationUser: { type: Schema.ObjectId, ref: 'user' },
	creationDate: { type: Date },
	operationType: { type: String, trim: true },
	updateUser: { type: Schema.ObjectId, ref: 'user' },
	updateDate: { type: Date }
});

module.exports = CompanyNewsSchema;