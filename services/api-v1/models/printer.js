'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PrinterSchema = new Schema({
	name: { type: String, trim: true },
	origin: { type: Number, default: 0 },
	connectionURL: { type: String, trim: true },
	type: { type: String, trim: true },
	pageWidth: { type: Number, default: 297 },
	pageHigh: { type: Number, default: 210 },
    labelWidth: { type: Number, default: 0 },
	labelHigh: { type: Number, default: 0 },
	printIn: { type: String, trim: true },
	url: { type: String, trim: true },
	orientation: { type: String, trim: true }, //hporizantal vertical
	row: { type: Number }, //espacio entre filas del for
	addPag: { type: Number }, // addPage()
    quantity: { type: Number }, // addPage()
	fields: [{
		type: { type: String, trim: true }, //field,line,movArticle,movCash,movCancellation
		label: { type: String, trim: true },
		value: { type: String, trim: true },
		font: { type: String, trim: true }, //courier,times,helvetica
		fontType: { type: String, trim: true }, //normal,italic,bold,bolditalic
		fontSize: { type: Number },
		positionStartX: { type: Number },
		positionStartY: { type: Number },
		positionEndX: { type: Number },
		positionEndY: { type: Number },
		splitting: { type: Number },
		colour: { type: String, trim: true }, // 4,5,9
		position: { type: String, trim: true }
	}],
	creationUser: { type: Schema.ObjectId, ref: 'user' },
	creationDate: { type: Date },
	operationType: { type: String, trim: true },
	updateUser: { type: Schema.ObjectId, ref: 'user' },
	updateDate: { type: Date }
});

module.exports = PrinterSchema;

