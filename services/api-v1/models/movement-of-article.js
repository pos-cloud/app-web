'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const MovementOfArticleSchema = new Schema({
  code: { type: String, trim: true },
  codeSAT: { type: String, trim: true },
  description: { type: String, trim: true },
  observation: { type: String, trim: true },
  basePrice: { type: Number, default: 0 },
  otherFields: [{
    articleField: { type: Schema.ObjectId, ref: 'article-field' },
    name: { type: String, trim: true },
    datatype: { type: String, trim: true },
    value: { type: String, trim: true },
    amount: { type: Number, default: 0 },
  }],
  taxes: [{
    tax: { type: Schema.ObjectId, ref: 'tax' },
    percentage: { type: Number, default: 0 },
    taxBase: { type: Number, default: 0 },
    taxAmount: { type: Number, default: 0 },
  }],
  movementParent: { type: Schema.ObjectId, ref: 'movement-of-article' },
  movementOrigin: { type: Schema.ObjectId, ref: 'movement-of-article' },
  isOptional: { type: Boolean, default: false },
  costPrice: { type: Number, default: 0 },
  unitPrice: { type: Number, default: 0 },
  markupPercentage: { type: Number, default: 0 },
  markupPriceWithoutVAT: { type: Number, default: 0 },
  markupPrice: { type: Number, default: 0 },
  discountRate: { type: Number, default: 0 },
  discountAmount: { type: Number, default: 0 },
  transactionDiscountAmount: { type: Number, default: 0 },
  salePrice: { type: Number, default: 0 },
  roundingAmount: { type: Number, default: 0 },
  make: { type: Schema.ObjectId, ref: 'make' },
  category: { type: Schema.ObjectId, ref: 'category' },
  amount: { type: Number, default: 1 },
  deposit: { type: Schema.ObjectId, ref: 'deposit' },
  quantityForStock: { type: Number, default: 0 },
  notes: { type: String, trim: true },
  printIn: { type: String, trim: true },
  status: { type: String, trim: true, default: 'Listo' },
  printed: { type: Number, default: 0 },
  read: { type: Number, default: 0 },
  article: { type: Schema.ObjectId, ref: 'article' },
  transaction: { type: Schema.ObjectId, ref: 'transaction' },
  measure: { type: String, trim: true },
  quantityMeasure: { type: Number },
  modifyStock: { type: Boolean, default: false },
  stockMovement: { type: String, trim: true },
  transactionEndDate: { type: Date },
  isGeneratedByPayment: { type: Boolean, default: false },
  isGeneratedByRule: { type: Boolean, default: false },
  account: { type: Schema.ObjectId, ref: 'account' },
  recalculateParent: { type: Boolean, default: true },
  creationUser: { type: Schema.ObjectId, ref: 'user' },
  creationDate: { type: Date },
  operationType: { type: String, trim: true },
  updateUser: { type: Schema.ObjectId, ref: 'user' },
  updateDate: { type: Date },
})

module.exports = MovementOfArticleSchema