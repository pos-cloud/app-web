'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var SessionSchema = new Schema({
	type: { type: String, trim: true },
	state: { type: String, trim: true },
	date: { type: Date },
	user: { type: Schema.ObjectId, ref: 'user' },
	userName: { type: String, trim: true },
	token: { type: String, trim: true },
	tokenExpiration: { type: Date }
});

module.exports = SessionSchema;