'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CategorySchema = new Schema({
	order: { type: Number, default: 1 },
	description: { type: String, trim: true },
	picture: { type: String, trim: true, default: 'default.jpg' },
	visibleInvoice: { type: Boolean, default: false },
	visibleOnSale: { type: Boolean, default: true },
	visibleOnPurchase: { type: Boolean, default: true },
    ecommerceEnabled: { type: Boolean, default: false },
    favourite: { type: Boolean, default: false },
    applications: [{ type: Schema.ObjectId, ref: 'application' }],
    isRequiredOptional: { type: Boolean, default: false },
    parent: { type: Schema.ObjectId, ref: 'category' },
	wooId: { type: String },
	creationUser: { type: Schema.ObjectId, ref: 'user' },
	creationDate: { type: Date },
	operationType: { type: String, trim: true },
	updateUser: { type: Schema.ObjectId, ref: 'user' },
	updateDate: { type: Date }
});

module.exports = CategorySchema;

