'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const BranchSchema = new Schema({
  code: { type: String, trim: true, required: true },
  name: { type: String, trim: true, required: true },
  description: { type: String },
  termsAndConditions: { type: String },
  startDate: { type: Date },
  endDate: { type: Date },
  minAmount: { type: Number, default: 0 },
  minQuantity: { type: Number, deafult: 0 },
  transactionAmountLimit: { type: Number, default: 0 },
  totalStock: { type: Number, default: 1, required: true },
  currentStock: { type: Number, default: 0 },
  madeIn: { type: String },
  active: { type: Boolean, default: true },
  discountType: { type: String, enum: ['percentage', 'amount'], required: true },
  discountValue: { type: Number, default: 0 },
  article: { type: Schema.Types.ObjectId, ref: 'article' },
  item: { type: Schema.Types.ObjectId, ref: 'article' }
})

module.exports = BranchSchema
