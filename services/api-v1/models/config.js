'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ConfigSchema = new Schema({
	numberCompany: { type: String, trim: true },
	license: { type: String, trim: true },
	expirationLicenseDate: { type: Date },
	licensePaymentDueDate: { type: Date },
	licenseCost: { type: Number, default: 0 },
	services: [{
		name: { type: String },
		cost: { type: Number, default: 0 },
		period: { type: String, default: 'Mensual' },
		totalCharged: { type: Number, default: 0 },
		url: { type: String },
		commissionPercentage: { type: Number, default: 0 },
		commissionAmount: { type: Number, default: 0 },
		expiration: { type: String },
	}],
	balance: { type: Number, default: 0 },
	apiHost: { type: String, trim: true },
	apiPort: { type: Number },
	emailAccount: { type: String, trim: true },
	emailPassword: { type: String, trim: true },
	emailHost: { type: String, trim: true },
	emailPort: { type: Number, trim: true },
	companyPicture: { type: String, trim: true, default: 'default.jpg' },
	companyName: { type: String, trim: true },
	companyFantasyName: { type: String, trim: true },
	companyCUIT: { type: String, trim: true },
	companyIdentificationType: { type: Schema.ObjectId, ref: 'identification-type' },
	companyIdentificationValue: { type: String, trim: true },
	companyVatCondition: { type: Schema.ObjectId, ref: 'vat-condition' },
	companyStartOfActivity: { type: Date },
	companyGrossIncome: { type: String, trim: true },
	companyAddress: { type: String, trim: true },
	companyPhone: { type: String, trim: true },
	companyPostalCode: { type: String, trim: true },
	modules: { type: JSON },
	footerInvoice: { type: String, trim: true },
	showLicenseNotification: { type: Boolean, default: true },
	latitude: { type: String, trim: true },
	longitude: { type: String, trim: true },
	country: { type: String, trim: true, default: 'AR' },
	timezone: { type: String, trim: true, default: 'UTC-03:00' },
	currency: { type: Schema.ObjectId, ref: 'currency' },
	operationType: { type: String, trim: true },
	creationUser: { type: Schema.ObjectId, ref: 'user' },
	creationDate: { type: Date },
	operationType: { type: String, trim: true },
	updateUser: { type: Schema.ObjectId, ref: 'user' },
	updateDate: { type: Date },
	article: {
		code: {
			validators: {
				maxLength: { type: Number, default: 10 }
			}
		},
		isWeigth: {
			default: { type: Boolean, default: false }
		},
		salesAccount: {
			default: { type: Schema.ObjectId, ref: 'account', default: null }
		},
		purchaseAccount: {
			default: { type: Schema.ObjectId, ref: 'account', default: null }
		},
		allowSaleWithoutStock: {
			default: { type: Boolean, default: false }
		}
	},
	company: {
		// allowCurrentAccount: {
		// 	default: { type: Boolean, default: false }
		// },
		allowCurrentAccountProvider: {
			default: { type: Boolean, default: false }
		}
		,
		allowCurrentAccountClient: {
			default: { type: Boolean, default: false }
		}
		,
		vatCondition: {
			default: { type: Schema.ObjectId, ref: 'vat-condition', default: null }
		},
		accountClient: {
			default: { type: Schema.ObjectId, ref: 'account', default: null }
		},
		accountProvider: {
			default: { type: Schema.ObjectId, ref: 'account', default: null }
		}
	},
	cashBox: {
		perUser: { type: Boolean, default: false }
	},
	reports: {
		summaryOfAccounts: {
			detailsPaymentMethod: { type: Boolean, default: false },
			invertedViewClient: { type: Boolean, default: false },
			invertedViewProvider: { type: Boolean, default: false }
		}
	},
	tradeBalance: {
		codePrefix: { type: Number, default: 0 },
    numberOfCode: { type: Number, default: 4 },
		numberOfQuantity: { type: Number, default: 2 },
		numberOfIntegers: { type: Number, default: 3 },
		numberOfDecimals: { type: Number, default: 2 }
	},
	voucher: {
		readingLimit: { type: Number, default: 0 },
		minutesOfExpiration: { type: Number, default: 720 }
	},
	twilio: {
		senderNumber: { type: String },
		accountSid: { type: String },
		authToken: { type: String }
	},
	tiendaNube:{
		token: { type: String},
		userID: { type: String },
		appID: { type: String },
		clientSecret: { type: String }
	},
	ecommerceCost: { type: Number, default: 0 },
	ecommercePlan: {
		name: { type: String, enum: ["Basic", "Advance", "Premium"] },
		cost: { type: Number, default: 0 },
		pergentaje: { type: Number, default: 0 },
	}
});

module.exports = ConfigSchema;