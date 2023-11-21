'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var VariantTypeSchema = new Schema({
	order: { type: Number, default: 1 },
	name: { type: String, trim: true },
	meliId: { type: String },
	creationUser: { type: Schema.ObjectId, ref: 'user' },
	creationDate: { type: Date },
	operationType: { type: String, trim: true },
	updateUser: { type: Schema.ObjectId, ref: 'user' },
	updateDate: { type: Date }
});

module.exports = VariantTypeSchema;
