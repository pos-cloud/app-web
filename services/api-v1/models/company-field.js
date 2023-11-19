'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CompanyFieldSchema = new Schema({
	name: { type: String, trim: true },
	datatype: { type: String, trim: true },
	value: { type: String, trim: true },
	creationUser: { type: Schema.ObjectId, ref: 'user' },
	creationDate: { type: Date },
	operationType: { type: String, trim: true },
	updateUser: { type: Schema.ObjectId, ref: 'user' },
	updateDate: { type: Date }
});

module.exports = CompanyFieldSchema;