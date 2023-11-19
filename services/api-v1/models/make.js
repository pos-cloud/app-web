'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const MakeSchema = new Schema({
	description: { type: String, trim: true },
	visibleSale: { type: Boolean, default: false },
    ecommerceEnabled: { type: Boolean, default: false },
    applications: [{ type: Schema.ObjectId, ref: 'application' }],
	picture: { type: String, trim: true, default: 'default.jpg' },
	creationUser: { type: Schema.ObjectId, ref: 'user' },
	creationDate: { type: Date },
	operationType: { type: String, trim: true },
	updateUser: { type: Schema.ObjectId, ref: 'user' },
	updateDate: { type: Date }
});

module.exports = MakeSchema;

