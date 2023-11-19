'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Taxes = {
	tax: { type: Schema.ObjectId, ref: 'tax' },
	percentage: { type: Number, default: 0 },
	taxBase: { type: Number, default: 0 },
	taxAmount: { type: Number, default: 0 }
};

module.exports = Taxes;