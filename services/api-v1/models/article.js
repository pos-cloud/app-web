'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const ArticleSchema = new Schema({
  order: { type: Number, trim: true, default: 1 },
  type: { type: String, trim: true, default: 'Final' },
  containsVariants: { type: Boolean, default: false },
  containsStructure: { type: Boolean, default: false },
  code: { type: String, trim: true },
  codeProvider: { type: String, trim: true },
  codeSAT: { type: String, trim: true },
  description: { type: String, trim: true },
  url: { type: String, trim: true },
  posDescription: { type: String, trim: true },
  quantityPerMeasure: { type: Number, default: 1 },
  unitOfMeasurement: { type: Schema.ObjectId, ref: 'unit-of-measurement' },
  observation: { type: String, trim: true },
  notes: [{ type: String, trim: true }],
  tags: [{ type: String, trim: true }],
  basePrice: { type: Number, default: 0 },
  otherFields: [
    {
      articleField: { type: Schema.ObjectId, ref: 'article-field' },
      value: { type: String, trim: true },
      amount: { type: Number, default: 0 },
    },
  ],
  taxes: [
    {
      tax: { type: Schema.ObjectId, ref: 'tax' },
      percentage: { type: Number, default: 0 },
      taxBase: { type: Number, default: 0 },
      taxAmount: { type: Number, default: 0 },
    },
  ],
  costPrice: { type: Number, default: 0 },
  markupPercentage: { type: Number, default: 0 },
  markupPrice: { type: Number, default: 0 },
  salePrice: { type: Number, default: 0 },
  purchasePrice: { type: Number, default: 0 },
  currency: { type: Schema.ObjectId, ref: 'currency' },
  make: { type: Schema.ObjectId, ref: 'make' },
  category: { type: Schema.ObjectId, ref: 'category' },
  deposits: [
    {
      deposit: { type: Schema.ObjectId, ref: 'deposit' },
      capacity: { type: Number, default: 0 },
    },
  ],
  locations: [
    {
      location: { type: Schema.ObjectId, ref: 'location' },
    },
  ],
  children: [
    {
      article: { type: Schema.ObjectId, ref: 'article' },
      quantity: { type: Number },
    },
  ],
  pictures: [
    {
      picture: { type: String, trim: true, default: 'default.jpg' },
      meliId: { type: String },
    },
  ],
  barcode: { type: String, trim: true },
  wooId: { type: String },
  meliId: { type: String },
  meliAttrs: {
    category: { type: Object, trim: true },
    description: {
      plain_text: { type: String, trim: true, default: '' },
    },
    listing_type_id: { type: String, trim: true, default: 'free' },
    sale_terms: [
      {
        id: { type: String, trim: true },
        value_name: { type: Object },
      },
    ],
    attributes: [
      {
        id: { type: String, trim: true },
        value_name: { type: Object },
      },
    ],
  },
  printIn: { type: String, trim: true },
  posKitchen: { type: Boolean, default: false },
  allowPurchase: { type: Boolean, default: true },
  allowSale: { type: Boolean, default: true },
  allowStock: { type: Boolean, default: true },
  allowSaleWithoutStock: { type: Boolean, default: false },
  allowMeasure: { type: Boolean, default: false },
  ecommerceEnabled: { type: Boolean, default: false },
  favourite: { type: Boolean, default: false },
  isWeigth: { type: Boolean, default: false },
  forShipping: { type: Boolean, default: false },
  picture: { type: String, trim: true, default: 'default.jpg' },
  providers: [{ type: Schema.ObjectId, ref: 'company' }],
  provider: { type: Schema.ObjectId, ref: 'company' },
  applications: [{ type: Schema.ObjectId, ref: 'application' }],
  classification: { type: Schema.ObjectId, ref: 'classification' },
  creationUser: { type: Schema.ObjectId, ref: 'user' },
  creationDate: { type: Date },
  operationType: { type: String, trim: true },
  updateUser: { type: Schema.ObjectId, ref: 'user' },
  updateDate: { type: Date },
  harticle: { type: Schema.ObjectId, ref: 'article' },
  salesAccount: { type: Schema.ObjectId, ref: 'account' },
  purchaseAccount: { type: Schema.ObjectId, ref: 'account' },
  minStock: { type: Number },
  maxStock: { type: Number },
  pointOfOrder: { type: Number },
  m3: { type: Number },
  weight: { type: String},
  width: { type: String},
  height: { type: String},
  depth: { type: String},

})

module.exports = ArticleSchema
