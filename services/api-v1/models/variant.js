'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var VariantSchema = new Schema({
	type: { type: Schema.ObjectId, ref: 'variant-type' },
	value: { type: Schema.ObjectId, ref: 'variant-value' },
	articleParent: { type: Schema.ObjectId, ref: 'article' },
	articleChild: { type: Schema.ObjectId, ref: 'article' },
	creationUser: { type: Schema.ObjectId, ref: 'user' },
	creationDate: { type: Date },
	operationType: { type: String, trim: true },
	updateUser: { type: Schema.ObjectId, ref: 'user' },
	updateDate: { type: Date }
});

module.exports = VariantSchema;
