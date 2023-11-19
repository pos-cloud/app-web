'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var OriginSchema = new Schema({
	number: { type: Number, default: 0 },
	branch: { type: Schema.ObjectId, ref: 'branch' },
	creationUser: { type: Schema.ObjectId, ref: 'user' },
	creationDate: { type: Date },
	operationType: { type: String, trim: true },
	updateUser: { type: Schema.ObjectId, ref: 'user' },
	updateDate: { type: Date }
});

module.exports = OriginSchema;