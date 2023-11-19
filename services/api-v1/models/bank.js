'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const BankSchema = new Schema({
	code: { type: Number },
	agency: { type: Number },
	account: { type: Schema.ObjectId, ref: 'account' },
	name: { type: String, trim: true },
	creationUser: { type: Schema.ObjectId, ref: 'user' },
	creationDate: { type: Date },
	operationType: { type: String, trim: true },
	updateUser: { type: Schema.ObjectId, ref: 'user' },
	updateDate: { type: Date }
});

module.exports = BankSchema;

