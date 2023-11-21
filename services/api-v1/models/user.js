'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
    branch : { type: Schema.ObjectId, ref: 'branch' },
	name: { type: String, trim: true },
	phone: { type: String, trim: true },
	email: { type: String, trim: true, lowercase: true },
	password: { type: String, trim: true },
	state: { type: String, trim: true },
	token: { type: String, trim: true },
	employee: { type: Schema.ObjectId, ref: 'employee' },
	company: { type: Schema.ObjectId, ref: 'company' },
	origin: { type: Schema.ObjectId, ref: 'origin' },
	tokenExpiration: { type: Number, default: 1440 },
	shortcuts: [{
		name: { type: String, trim: true },
		url: { type: String, trim: true },
	}],
	printers: [{
		printer: { type: Schema.ObjectId, ref: 'printer' }
    }],
    permission : { type: Schema.ObjectId, ref: 'permission'},
    cashBoxType: { type: Schema.ObjectId, ref: 'cash-box-type' },
    level : { type: Number, default: 99 },
	creationUser: { type: Schema.ObjectId, ref: 'user' },
	creationDate: { type: Date },
	operationType: { type: String, trim: true },
	updateUser: { type: Schema.ObjectId, ref: 'user' },
	updateDate: { type: Date }
});

module.exports = UserSchema;
