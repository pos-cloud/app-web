'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const DatabaseSchema = new Schema({
	name: { type: String, trim: true },
	email: { type: String, trim: true },
	creationDate: { type: Date },
	operationType: { type: String, trim: true },
	updateDate: { type: Date }
});

module.exports = DatabaseSchema;

