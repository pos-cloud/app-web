'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ArticleStockSchema = new Schema({
	article: { type: Schema.ObjectId, ref: 'article' },
	branch: { type: Schema.ObjectId, ref: 'branch' },
	deposit: { type: Schema.ObjectId, ref: 'deposit' },
	realStock: { type: Number, default: 0 },
	minStock: { type: Number, default: 0 },
	maxStock: { type: Number },
	creationUser: { type: Schema.ObjectId, ref: 'user' },
	creationDate: { type: Date },
	operationType: { type: String },
	updateUser: { type: Schema.ObjectId, ref: 'user' },
	updateDate: { type: Date }
});

module.exports = ArticleStockSchema;