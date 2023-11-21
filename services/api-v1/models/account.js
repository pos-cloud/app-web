'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const AccountSchema = new Schema({
    code: { type: String, trim: true },
    description: { type: String, trim: true, required: true },
    type: { type: String, trim: true, enum: ['Activo', 'Pasivo', 'Patrimonio Neto', 'Resultado', 'Compensatoria', 'Otro'] },
    mode: { type: String, trim: true, enum: ['Sintetico', 'Analitico'] },
    parent: { type: Schema.Types.ObjectId, ref: 'account' },
});

module.exports = AccountSchema;