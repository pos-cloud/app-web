'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CompanyFields = {
	companyField: { type: Schema.ObjectId, ref: 'company-field' },
	name: { type: String, trim: true },
	datatype: { type: String, trim: true },
	value: { type: String, trim: true },
	amount: { type: Number, default: 0 }
};

module.exports = CompanyFields;