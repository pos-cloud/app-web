'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var RoomSchema = new Schema({
	description: { type: String, trim: true },
	creationUser: { type: Schema.ObjectId, ref: 'user' },
	creationDate: { type: Date },
	operationType: { type: String, trim: true },
	updateUser: { type: Schema.ObjectId, ref: 'user' },
	updateDate: { type: Date }
});

module.exports = RoomSchema;

