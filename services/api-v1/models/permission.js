'use strict';

const { ObjectID } = require('bson');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PermissionSchema = new Schema({
  name: { type: String, trim: true, required: true, unique: true },
  collections: {
    transactions: {
      view: { type: Boolean },
      add: { type: Boolean },
      edit: { type: Boolean },
      delete: { type: Boolean },
      export: { type: Boolean },
    },
    articles: {
      view: { type: Boolean },
      add: { type: Boolean },
      edit: { type: Boolean },
      delete: { type: Boolean },
      export: { type: Boolean },
    },
    companies: {
      view: { type: Boolean },
      add: { type: Boolean },
      edit: { type: Boolean },
      delete: { type: Boolean },
      export: { type: Boolean },
    },
    movementsOfArticles: {
      view: { type: Boolean },
      add: { type: Boolean },
      edit: { type: Boolean },
      delete: { type: Boolean },
      export: { type: Boolean },
    },
  },
  menu: {
    sales: {
      counter: { type: Boolean },
      tiendaNube: { type: Boolean },
      wooCommerce: { type: Boolean },
      delivery: { type: Boolean },
      voucherReader: { type: Boolean },
      resto: { type: Boolean },
    },
    resto: { type: Boolean },
    money: { type: Boolean },
    production: { type: Boolean },
    purchases: { type: Boolean },
    stock: { type: Boolean },
    articles: { type: Boolean },
    companies: {
      client: { type: Boolean },
      provider: { type: Boolean },
      group: { type: Boolean },
    },
    gallery: { type: Boolean },
    report: { type: Boolean },
    config: { type: Boolean },
  },
  filterTransaction: { type: Boolean, default: false },
  filterCompany: { type: Boolean, default: false },
  transactionTypes: [{ type: Schema.Types.ObjectId, ref: 'transaction-type' }],
  editArticle: { type: Boolean, default: true },
  allowDiscount: { type: Boolean, default: true },
  allowPayment: { type: Boolean, default: true },
});

module.exports = PermissionSchema;
