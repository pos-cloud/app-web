'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var EmployeeSchema = new Schema({
	code: { type: Number, default: 0 },
	name: { type: String, trim: true },
	type: { type: Schema.ObjectId, ref: 'employee-type' },
	creationUser: { type: Schema.ObjectId, ref: 'user' },
	creationDate: { type: Date },
	operationType: { type: String, trim: true },
	updateUser: { type: Schema.ObjectId, ref: 'user' },
	updateDate: { type: Date }
});

module.exports = EmployeeSchema;