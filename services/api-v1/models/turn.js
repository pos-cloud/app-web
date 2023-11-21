'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var TurnSchema = new Schema({
	startDate: { type: Date },
	endDate: { type: Date },
	state: { type: String, trim: true },
	employee: { type: Schema.ObjectId, ref: 'employee' },
	creationUser: { type: Schema.ObjectId, ref: 'user' },
	creationDate: { type: Date },
	operationType: { type: String, trim: true },
	updateUser: { type: Schema.ObjectId, ref: 'user' },
	updateDate: { type: Date }
});

module.exports = TurnSchema;