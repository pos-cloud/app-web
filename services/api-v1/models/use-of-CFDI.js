'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UseOfCFDISchema = new Schema({
	code: { type: String, trim: true },
	description: { type: String, trim: true },
	creationUser: { type: Schema.ObjectId, ref: 'user' },
	creationDate: { type: Date },
	operationType: { type: String, trim: true },
	updateUser: { type: Schema.ObjectId, ref: 'user' },
	updateDate: { type: Date }
});

module.exports = UseOfCFDISchema;