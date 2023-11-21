'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PrintSchema = new Schema({
	fileName: { type: String, trim: true },
	content: { type: String, trim: true }
});

module.exports = PrintSchema;

