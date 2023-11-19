'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var DepositSchema = new Schema({
	name: { type: String, trim: true },
	capacity: { type: Number },
	branch: { type: Schema.ObjectId, ref: 'branch' },
	default: { type: Boolean, default: false },
	creationUser: { type: Schema.ObjectId, ref: 'user' },
	creationDate: { type: Date },
	operationType: { type: String, trim: true },
	updateUser: { type: Schema.ObjectId, ref: 'user' },
	updateDate: { type: Date }
});

module.exports = DepositSchema;