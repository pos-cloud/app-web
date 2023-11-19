'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CompanyFields = require('./company-fields');

var CompanySchema = new Schema({
	code: { type: String,trim: true },
	name: { type: String, trim: true },
	fantasyName: { type: String, trim: true },
	entryDate: { type: Date },
	type: { type: String, trim: true },
	category: { type: String, trim: true },
	vatCondition: { type: Schema.ObjectId, ref: 'vat-condition' },
	identificationType: { type: Schema.ObjectId, ref: 'identification-type' },
	identificationValue: { type: String, trim: true },
	CUIT: { type: String, trim: true },
	DNI: { type: String, trim: true },
	grossIncome: { type: String, trim: true },
	address: { type: String, trim: true },
	city: { type: String, trim: true },
	phones: { type: String, trim: true },
	emails: { type: String, trim: true },
	birthday: { type: Date },
	gender: { type: String, trim: true },
	observation: { type: String, trim: true },
	wooId: { type: String },
	allowCurrentAccount: { type: Boolean, default: false },
	country: { type: Schema.ObjectId, ref: 'country' },
	floorNumber: { type: String, trim: true },
	flat: { type: String, trim: true },
	state: { type: Schema.ObjectId, ref: 'state' },
	addressNumber: { type: String, trim: true },
	otherFields: { type: CompanyFields },
	group: { type: Schema.ObjectId, ref: 'company-group' },
	employee: { type: Schema.ObjectId, ref: 'employee' },
	transport: { type: Schema.ObjectId, ref: 'transport' },
	priceList: { type: Schema.ObjectId, ref: 'price-list' },
	latitude: { type: String, trim: true },
    longitude: { type: String, trim: true },
    zipCode: { type: String, trim: true },
    discount : { type: Number, trum: true},
    account : { type: Schema.ObjectId, ref: 'account' },
    creditLimit : { type: Number, trum: true, default : 0},
	creationUser: { type: Schema.ObjectId, ref: 'user' },
	creationDate: { type: Date },
	operationType: { type: String, trim: true },
	updateUser: { type: Schema.ObjectId, ref: 'user' },
	updateDate: { type: Date },
});

module.exports = CompanySchema;