'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const MovementOfCashSchema = new Schema({
  date: { type: Date },
  expirationDate: { type: Date },
  statusCheck: { type: String, trim: true },
  discount: { type: Number, default: 0 },
  surcharge: { type: Number, default: 0 },
  commissionAmount: { type: Number, default: 0 },
  administrativeExpenseAmount: { type: Number, default: 0 },
  otherExpenseAmount: { type: Number, default: 0 },
  quota: { type: Number, default: 1 },
  capital: { type: Number, default: 0 },
  interestPercentage: { type: Number, default: 0 },
  interestAmount: { type: Number, default: 0 },
  taxPercentage: { type: Number, default: 0 },
  taxAmount: { type: Number, default: 0 },
  amountPaid: { type: Number, default: 0 },
  amountDiscount: { type: Number, default: 0 },
  balanceCanceled: { type: Number, default: 0 },
  cancelingTransaction: { type: Schema.ObjectId, ref: 'transaction' },
  observation: { type: String, trim: true },
  type: { type: Schema.ObjectId, ref: 'payment-method' },
  transaction: { type: Schema.ObjectId, ref: 'transaction' },
  receiver: { type: String, trim: true },
  number: { type: String, trim: true },
  bank: { type: Schema.ObjectId, ref: 'bank' },
  titular: { type: String, trim: true },
  CUIT: { type: String, trim: true },
  deliveredBy: { type: String, trim: true },
  paymentChange: { type: Number, default: 0 },
  currencyValues: [{
    value: { type: Number, default: 0 },
    quantity: { type: Number, default: 0 },
  }],
  creationUser: { type: Schema.ObjectId, ref: 'user' },
  creationDate: { type: Date },
  operationType: { type: String, trim: true },
  updateUser: { type: Schema.ObjectId, ref: 'user' },
  updateDate: { type: Date },
})

module.exports = MovementOfCashSchema
