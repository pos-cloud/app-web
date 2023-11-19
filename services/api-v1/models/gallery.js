'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var GallerySchema = new Schema({
	name: { type: String, trim: true },
	colddown: { type: Number },
	speed: { type: Number },
    barcode: { type: Boolean, default: false },
	resources: [{
		resource: { type: Schema.ObjectId, ref: 'resource' },
		order: { type: Number }
	}],
	creationUser: { type: Schema.ObjectId, ref: 'user' },
	creationDate: { type: Date },
	operationType: { type: String, trim: true },
	updateUser: { type: Schema.ObjectId, ref: 'user' },
	updateDate: { type: Date }
});

module.exports = GallerySchema;