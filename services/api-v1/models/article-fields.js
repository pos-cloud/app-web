'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ArticleFields = {
	articleField: { type: Schema.ObjectId, ref: 'article-field' },
	name: { type: String, trim: true },
	datatype: { type: String, trim: true },
	value: { type: String, trim: true },
	amount: { type: Number, default: 0 }
};

module.exports = ArticleFields;