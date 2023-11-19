'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const MovementOfCancellationSchema = new Schema({
	transactionOrigin: { type: Schema.ObjectId, ref: 'transaction' },
    transactionDestination: { type: Schema.ObjectId, ref: 'transaction' },
    type : { type: Schema.ObjectId, ref: 'cancellation-type' },
	balance: { type: Number, default: 0 }, // UTILIZADA PARA SABER CUANTO ES EL MONTO A CACELAR POR LA TRANSACTION DESTINO.
	creationUser: { type: Schema.ObjectId, ref: 'user' },
	creationDate: { type: Date },
	operationType: { type: String, trim: true },
	updateUser: { type: Schema.ObjectId, ref: 'user' },
	updateDate: { type: Date }
});

module.exports = MovementOfCancellationSchema;