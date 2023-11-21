'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ArticleFieldSchema = new Schema({
	order: { type: Number, default: 1 },
	name: { type: String, trim: true },
	datatype: { type: String, trim: true },
	value: { type: String, trim: true },
	modify: { type: Boolean, default: false },
	modifyVAT: { type: Boolean, default: false },
	discriminateVAT: { type: Boolean, default: false },
	ecommerceEnabled: { type: Boolean, default: false },
	wooId: { type: String },
	creationUser: { type: Schema.ObjectId, ref: 'user' },
	creationDate: { type: Date },
	operationType: { type: String, trim: true },
	updateUser: { type: Schema.ObjectId, ref: 'user' },
	updateDate: { type: Date }
});

module.exports = ArticleFieldSchema;