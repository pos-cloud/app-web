'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const CancellationTypeSchema = new Schema({
    origin: { type: Schema.ObjectId, ref: 'transaction-type' },
	destination: { type: Schema.ObjectId, ref: 'transaction-type' },
	automaticSelection: { type: Boolean, default: true },
    modifyBalance: { type: Boolean, default: true },
    requestAutomatic: { type: Boolean, default: false },
	requestCompany: { type: Boolean, default: true },
	requestStatusOrigin: { type: String, default: 'Cerrado' },
    stateOrigin: { type: String, trim: true },
    updatePrices: { type: Boolean, default: false },
    creationUser: { type: Schema.ObjectId, ref: 'user' },
    creationDate: { type: Date },
    operationType: { type: String, trim: true },
    updateUser: { type: Schema.ObjectId, ref: 'user' },
    updateDate: { type: Date }
});

module.exports = CancellationTypeSchema;

