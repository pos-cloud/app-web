'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var TableSchema = new Schema({
	description: { type: String, trim: true },
	room: { type: Schema.ObjectId, ref: 'room' },
	chair: { type: Number, default: 0 },
	diners: { type: Number, default: 0 },
	state: { type: String, trim: true },
	employee: { type: Schema.ObjectId, ref: 'employee' },
	lastTransaction: { type: Schema.ObjectId, ref: 'transaction' },
	creationUser: { type: Schema.ObjectId, ref: 'user' },
	creationDate: { type: Date },
	operationType: { type: String, trim: true },
	updateUser: { type: Schema.ObjectId, ref: 'user' },
	updateDate: { type: Date }
});

module.exports = TableSchema;