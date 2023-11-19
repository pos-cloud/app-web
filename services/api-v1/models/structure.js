'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const StructureSchema = new Schema({
	parent: { type: Schema.ObjectId, ref: 'article' },
	child: { type: Schema.ObjectId, ref: 'article' },
	quantity: { type: Number, default: 0 },
	utilization: { type: String, trim: true },
	increasePrice: { type: Number },
	optional: { type: Boolean, default: false },
	creationUser: { type: Schema.ObjectId, ref: 'user' },
	creationDate: { type: Date },
	operationType: { type: String, trim: true },
	updateUser: { type: Schema.ObjectId, ref: 'user' },
	updateDate: { type: Date }
});

module.exports = StructureSchema;