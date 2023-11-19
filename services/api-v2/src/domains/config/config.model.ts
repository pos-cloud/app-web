import { Schema } from 'mongoose'

import MongooseModel from './../../db/mongoose-model'
import Model from './../model/model'
class ConfigSchema extends Model {
	public name: string = 'config'

	constructor() {
		super({
			numberCompany: { type: String, trim: true, required: true },
			license: { type: String, trim: true, required: true },
			expirationLicenseDate: { type: Date, required: true },
			licensePaymentDueDate: { type: Date },
			licenseCost: { type: Number, default: 0 },
			services: [
				{
					name: { type: String },
					cost: { type: Number, default: 0 },
					period: { type: String, default: 'Mensual' },
					totalCharged: { type: Number, default: 0 },
					url: { type: String },
					commissionPercentage: { type: Number, default: 0 },
					commissionAmount: { type: Number, default: 0 },
					expiration: { type: String },
				},
			],
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
			companyIdentificationType: {
				type: Schema.Types.ObjectId,
				ref: 'identification-type',
			},
			companyIdentificationValue: { type: String, trim: true },
			companyVatCondition: { type: Schema.Types.ObjectId, ref: 'vat-condition' },
			companyStartOfActivity: { type: Date },
			companyGrossIncome: { type: String, trim: true },
			companyAddress: { type: String, trim: true },
			companyPhone: { type: String, trim: true },
			companyPostalCode: { type: String, trim: true },
			modules: { type: JSON, required: true },
			footerInvoice: { type: String, trim: true },
			showLicenseNotification: { type: Boolean, default: true },
			latitude: { type: String, trim: true },
			longitude: { type: String, trim: true },
			country: { type: String, trim: true, default: 'AR' },
			timezone: { type: String, trim: true, default: 'UTC-03:00' },
			currency: { type: Schema.Types.ObjectId, ref: 'currency' },
			article: {
				code: {
					validators: {
						maxLength: { type: Number, default: 10 },
					},
				},
				isWeigth: {
					default: { type: Boolean, default: false },
				},
				allowSaleWithoutStock: {
					default: { type: Boolean, default: false },
				},
				salesAccount: {
					default: { type: Schema.Types.ObjectId, ref: 'account', default: null },
				},
				purchaseAccount: {
					default: { type: Schema.Types.ObjectId, ref: 'account', default: null },
				},
			},
			company: {
				// allowCurrentAccount: {
				// 	default: { type: Boolean, default: false }
				// },
				allowCurrentAccountProvider: {
					default: { type: Boolean, default: false },
				},
				allowCurrentAccountClient: {
					default: { type: Boolean, default: false },
				},
				vatCondition: {
					default: { type: Schema.Types.ObjectId, ref: 'vat-condition', default: null },
				},
				accountClient: {
					default: { type: Schema.Types.ObjectId, ref: 'account', default: null },
				},
				accountProvider: {
					default: { type: Schema.Types.ObjectId, ref: 'account', default: null },
				},
			},
			cashBox: {
				perUser: { type: Boolean, default: false },
			},
			reports: {
				summaryOfAccounts: {
					detailsPaymentMethod: { type: Boolean, default: false },
					invertedViewClient: { type: Boolean, default: false },
					invertedViewProvider: { type: Boolean, default: false },
				},
			},
			tradeBalance: {
				codePrefix: { type: Number, default: 0 },
				numberOfCode: { type: Number, default: 4 },
				numberOfQuantity: { type: Number, default: 2 },
				numberOfIntegers: { type: Number, default: 3 },
				numberOfDecimals: { type: Number, default: 2 },
			},
			voucher: {
				readingLimit: { type: Number, default: 0 },
				minutesOfExpiration: { type: Number, default: 720 },
			},
			twilio: {
				senderNumber: { type: String, default: null },
				accountSid: { type: String, default: null },
				authToken: { type: String, default: null },
			},
			tiendaNube: {
				token: { type: String, default: null },
				userID: { type: String, default: null },
				appID: { type: String, default: null },
				clientSecret: { type: String, default: null }
			}
		})
	}

	public getPath(): string {
		return '/configs'
	}

	public getInstance(database: string) {
		return new (new MongooseModel(this, database).getModel(this.name))()
	}
}

export default new ConfigSchema()
