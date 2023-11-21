'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ClaimSchema = new Schema({
	name: { type: String, trim: true },
	description: { type: String, trim: true },
	type: { type: String, trim: true },
	priority: { type: String, trim: true },
	author: { type: String, trim: true },
	email: { type: String, trim: true },
	listName: { type: String, trim: true },
	file: { type: String, trim: true },
	creationUser: { type: Schema.ObjectId, ref: 'user' },
	creationDate: { type: Date },
	operationType: { type: String, trim: true },
	updateUser: { type: Schema.ObjectId, ref: 'user' },
	updateDate: { type: Date }
});

module.exports = ClaimSchema;

