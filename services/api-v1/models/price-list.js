'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PriceListSchema = new Schema({
	name: { type: String, trim: true },
	percentage: { type: Number },
	default: { type: Boolean, default: false },
	allowSpecialRules: { type: Boolean, default: false },
	rules: [{
		category: { type: Schema.ObjectId, ref: 'category' },
		make: { type: Schema.ObjectId, ref: 'make' },
		percentage: { type: Number },
	}],
	exceptions: [{
		article: { type: Schema.ObjectId, ref: 'article' },
		percentage: { type: Number },
	}],
	creationUser: { type: Schema.ObjectId, ref: 'user' },
	creationDate: { type: Date },
	operationType: { type: String, trim: true },
	updateUser: { type: Schema.ObjectId, ref: 'user' },
	updateDate: { type: Date }
});

module.exports = PriceListSchema;
