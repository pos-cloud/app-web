'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const BranchSchema = new Schema({
  number: { type: Number },
  name: { type: String, trim: true },
  default: { type: Boolean, default: false },
  image: { type: String, trim: true },
  creationUser: { type: Schema.ObjectId, ref: 'user' },
  creationDate: { type: Date },
  operationType: { type: String, trim: true },
  updateUser: { type: Schema.ObjectId, ref: 'user' },
  updateDate: { type: Date }
})

module.exports = BranchSchema
