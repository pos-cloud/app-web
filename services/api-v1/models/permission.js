'use strict'

const { ObjectID } = require('bson')
const mongoose = require('mongoose')
const Schema = mongoose.Schema

const PermissionSchema = new Schema({
  name: { type: String, trim: true, required: true, unique: true },
  collections: [
    {
      name: { type: String },
      actions: {
        view: { type: Boolean },
        add: { type: Boolean },
        edit: { type: Boolean },
        delete: { type: Boolean },
        export: { type: Boolean },
      },
      values: [
        {
          id: { type: ObjectID },
        },
      ],
    },
  ],
  menu: {
    sales: {
      counter: { type: Boolean },
      webOrders: { type: Boolean },
      delivery: { type: Boolean },
      voucherReader: { type: Boolean },
      resto: { type: Boolean },
    },
    gallery: { type: Boolean },
    resto: { type: Boolean },
    purchases: { type: Boolean },
    production: { type: Boolean },
    money: { type: Boolean },
    stock: { type: Boolean },
    articles: { type: Boolean },
    companies: {
      client: { type: Boolean },
      clientSummary: { type: Boolean },
      clientAccount: { type: Boolean },
      provider: { type: Boolean },
      providerSummary: { type: Boolean },
      providerAccount: { type: Boolean },
      group: { type: Boolean },
      field: { type: Boolean },
    },
    content: {
      resource: { type: Boolean },
      gallery: { type: Boolean },
    },
    report: { type: Boolean },
    config: { type: Boolean },
  },
  filterTransaction: {type: Boolean, default: false},
  filterCompany: {type: Boolean, default: false},
  transactionTypes: [{type: Schema.Types.ObjectId, ref: 'transaction-type'}],
  editArticle: {type: Boolean, default: true },
  allowDiscount: {type: Boolean, default: true },
  allowPayment: {type: Boolean, default: true }
})

module.exports = PermissionSchema
