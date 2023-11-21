'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PaymentMethodSchema = new Schema({
    code: { type: Number, default: 1 },
    order: { type: Number, default: 1 },
	name: { type: String, trim: true },
	discount: { type: Number, default: 0 },
	discountArticle: { type: Schema.ObjectId, ref: 'article' },
	surcharge: { type: Number, default: 0 },
	surchargeArticle: { type: Schema.ObjectId, ref: 'article' },
	commission: { type: Number, default: 0 },
	commissionArticle: { type: Schema.ObjectId, ref: 'article' },
	administrativeExpense: { type: Number, default: 0 },
	administrativeExpenseArticle: { type: Schema.ObjectId, ref: 'article' },
	otherExpense: { type: Number, default: 0 },
	otherExpenseArticle: { type: Schema.ObjectId, ref: 'article' },
	isCurrentAccount: { type: Boolean, default: false },
	acceptReturned: { type: Boolean, default: false },
	inputAndOuput: { type: Boolean, default: false },
    checkDetail: { type: Boolean, default: false },
    checkPerson: { type: Boolean, default: false },
	cardDetail: { type: Boolean, default: false },
	allowToFinance: { type: Boolean, default: false },
	payFirstQuota: { type: Boolean, default: true },
	cashBoxImpact: { type: Boolean, default: false },
	company: { type: String, trim: true },
	bankReconciliation: { type: Boolean, default: false },
	currency: { type: Schema.ObjectId, ref: 'currency' },
    allowCurrencyValue: { type: Boolean, default: false },
    allowBank: { type: Boolean, default: false },
	observation: { type: String, trim: true },
	mercadopagoAPIKey: { type: String, trim: true },
	mercadopagoClientId: { type: String, trim: true },
    mercadopagoAccessToken: { type: String, trim: true },
	whatsappNumber: { type: String, trim: true },
	applications: [{ type: Schema.ObjectId, ref: 'application' }],
    account : { type: Schema.ObjectId, ref: 'account' },
    expirationDays : { type : Number },
	creationUser: { type: Schema.ObjectId, ref: 'user' },
	creationDate: { type: Date },
	operationType: { type: String, trim: true },
	updateUser: { type: Schema.ObjectId, ref: 'user' },
	updateDate: { type: Date }
});

module.exports = PaymentMethodSchema;

