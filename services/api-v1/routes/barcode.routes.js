// https://github.com/padiazg/barcode-as-a-service

var express = require('express');
var codes = require('rescode');
var gm = require('gm');

var api = express.Router();

api.get('/barcode/:code', function (req, res, next) {

	// wich code is requested?
	var code = req.params.code.toLowerCase();

	// get parameters, overrides general parameters
	var value = req.query.value;

	// scale
	var scale = req.query.scale;
	scale = scale ? scale : 0;

	// ourput format
	var format = req.params.fmt;
	format = format ? format.toLowerCase() : 'png';

	var bc_options = {};
	var modules = [];

	switch (code) {
		case 'code128':
			bc_options = {
				"includetext": true
				, "guardwhitespace": true
				, "inkspread": 0
				, "scaleX": scale
				, "scaleY": scale
			};
			modules = ["code128"];
			break;

		case 'code39':
			bc_options = {
				"includetext": true
				, "guardwhitespace": true
				, "inkspread": 0
				, "scaleX": scale
				, "scaleY": scale
			};
			modules = ["code39"];
			break;

		case 'ean13':
			bc_options = {
				"includetext": true
				, "guardwhitespace": true
				, "inkspread": 0
				, "scaleX": scale
				, "scaleY": scale
			};
			modules = ["ean2", "ean5", "ean8", "ean13"];
			break;

		case 'pdf417':
			bc_options = {
				"includetext": false
				, "guardwhitespace": true
				, "inkspread": 0
				, "scaleX": scale
				, "scaleY": scale
			};
			modules = ["pdf417"];
			break;

		case 'qr':
			bc_options = {
				"includetext": false
				, "guardwhitespace": true
				, "inkspread": 0
				, "scaleX": scale
				, "scaleY": scale
			};
			modules = ["qrcode"];
			code = "qrcode";
			break;

		case 'datamatrix':
			bc_options = {
				"includetext": false
				, "guardwhitespace": true
				, "inkspread": 0
				, "scaleX": scale
				, "scaleY": scale
			};
			modules = ["datamatrix"];
			break;

		case 'interleaved2of5':
			bc_options = {
				"includetext": true
				, "guardwhitespace": true
				, "inkspread": 0
				, "scaleX": scale
				, "scaleY": scale
			};
			modules = ["interleaved2of5"];
			break;

		default:
			res.status(404).send({ message: 'Unknown:' + code });
			break;
	} // switch (code)  ...

	codes.loadModules(modules, bc_options);
	var bc = codes.create(code, value);
	var bc64 = Buffer.from(bc).toString('base64');
	// format output
	if (format === 'jpg') {
		gm(bc).toBuffer('JPG', function (err, buffer) {
			if (err) return handle(err);
			res.type('image/jpeg');
			res.send(buffer);
		});
	} else {
		//res.type('image/png');
		//res.send(bc);
		res.status(200).send({ bc64: bc64 });
	}
});

module.exports = api;