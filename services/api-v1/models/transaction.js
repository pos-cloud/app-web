'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const TransactionSchema = new Schema({
  origin: { type: Number, default: 0 },
  letter: { type: String, trim: true, default: '' },
  number: { type: Number, default: 0 },
  date: { type: Date },
  startDate: { type: Date },
  endDate: { type: Date },
  expirationDate: { type: Date },
  VATPeriod: { type: String, trim: true },
  observation: { type: String, trim: true, default: '' },
  basePrice: { type: Number, default: 0 },
  exempt: { type: Number, default: 0 },
  discountAmount: { type: Number, default: 0 },
  discountPercent: { type: Number, default: 0 },
  commissionAmount: { type: Number, default: 0 },
  administrativeExpenseAmount: { type: Number, default: 0 },
  otherExpenseAmount: { type: Number, default: 0 },
  taxes: [{
    tax: { type: Schema.ObjectId, ref: 'tax' },
    percentage: { type: Number, default: 0 },
    taxBase: { type: Number, default: 0 },
    taxAmount: { type: Number, default: 0 },
  }],
  totalPrice: { type: Number, default: 0 },
  roundingAmount: { type: Number, default: 0 },
  diners: { type: Number, default: 0 },
  orderNumber: { type: Number, default: 0 },
  state: { type: String, trim: true },
  madein: { type: String, trim: true },
  balance: { type: Number, default: 0 },
  CAE: { type: String, trim: true }, // AR
  CAEExpirationDate: { type: Date }, // AR
  stringSAT: { type: String, trim: true }, // MX
  CFDStamp: { type: String, trim: true }, // MX
  SATStamp: { type: String, trim: true }, // MX
  UUID: { type: String, trim: true }, // MX
  wooId: { type: String },
  currency: { type: Schema.ObjectId, ref: 'currency' },
  deliveryAddress: { type: Schema.ObjectId, ref: 'address' },
  quotation: { type: Number },
  relationType: { type: Schema.ObjectId, ref: 'relation-type' }, // MX
  useOfCFDI: { type: Schema.ObjectId, ref: 'use-of-cfdi' }, // MX
  type: { type: Schema.ObjectId, ref: 'transaction-type' },
  cashBox: { type: Schema.ObjectId, ref: 'cash-box' },
  table: { type: Schema.ObjectId, ref: 'table' },
  employeeOpening: { type: Schema.ObjectId, ref: 'employee' },
  employeeClosing: { type: Schema.ObjectId, ref: 'employee' },
  branchOrigin: { type: Schema.ObjectId, ref: 'branch' },
  branchDestination: { type: Schema.ObjectId, ref: 'branch' },
  depositOrigin: { type: Schema.ObjectId, ref: 'deposit' },
  depositDestination: { type: Schema.ObjectId, ref: 'deposit' },
  company: { type: Schema.ObjectId, ref: 'company' },
  transport: { type: Schema.ObjectId, ref: 'transport' },
  shipmentMethod: { type: Schema.ObjectId, ref: 'shipment-method' },
  turnOpening: { type: Schema.ObjectId, ref: 'turn' },
  turnClosing: { type: Schema.ObjectId, ref: 'turn' },
  printed: { type: Number, default: 0 },
  priceList: { type: Schema.ObjectId, ref: 'price-list' },
  account: { type: Schema.ObjectId, ref: 'account' },
  businessRules: [{ type: Schema.Types.ObjectId, ref: 'business-rule' }],
  tracking: [{ date: { type: Date, trim: true }, state: { type: String, trim: true } }],
  paymentMethodEcommerce: { type: String, trim: true },
  declaredValue: { type: Number, trim: true, default: 0 },
  package: { type: Number, trim: true, default: 0 },
  optionalAFIP: {
    id: { type: String, trim: true },
    value: { type: String, trim: true },
  },
  creationUser: { type: Schema.ObjectId, ref: 'user' },
  creationDate: { type: Date },
  operationType: { type: String, trim: true },
  updateUser: { type: Schema.ObjectId, ref: 'user' },
  updateDate: { type: Date },
})

module.exports = TransactionSchema
