// https://github.com/padiazg/barcode-as-a-service

const codes = require('rescode');
const gm = require('gm');

export function getBarcode(code:string, value: string){
	// wich code is requested?
	let codeDate = code.toLowerCase();

	// get parameters, overrides general parameters
	let valueDate = value;

	// scale
	let scaleDate= 0;
	scaleDate = scaleDate ? scaleDate : 0;

	// ourput format
	let format = 'png';
	format = format ? format.toLowerCase() : 'png';

	let bc_options = {};
	let modules: any = [];

	switch (codeDate) {
		case 'code128':
			bc_options = {
				"includetext": true
				, "guardwhitespace": true
				, "inkspread": 0
				, "scaleX": scaleDate
				, "scaleY": scaleDate
			};
			modules = ["code128"];
			break;

		case 'code39':
			bc_options = {
				"includetext": true
				, "guardwhitespace": true
				, "inkspread": 0
				, "scaleX": scaleDate
				, "scaleY": scaleDate
			};
			modules = ["code39"];
			break;

		case 'ean13':
			bc_options = {
				"includetext": true
				, "guardwhitespace": true
				, "inkspread": 0
				, "scaleX": scaleDate
				, "scaleY": scaleDate
			};
			modules = ["ean2", "ean5", "ean8", "ean13"];
			break;

		case 'pdf417':
			bc_options = {
				"includetext": false
				, "guardwhitespace": true
				, "inkspread": 0
				, "scaleX": scaleDate
				, "scaleY": scaleDate
			};
			modules = ["pdf417"];
			break;

		case 'qr':
			bc_options = {
				"includetext": false
				, "guardwhitespace": true
				, "inkspread": 0
				, "scaleX": scaleDate
				, "scaleY": scaleDate
			};
			modules = ["qrcode"];
			code = "qrcode";
			break;

		case 'datamatrix':
			bc_options = {
				"includetext": false
				, "guardwhitespace": true
				, "inkspread": 0
				, "scaleX": scaleDate
				, "scaleY": scaleDate
			};
			modules = ["datamatrix"];
			break;

		case 'interleaved2of5':
			bc_options = {
				"includetext": true
				, "guardwhitespace": true
				, "inkspread": 0
				, "scaleX": scaleDate
				, "scaleY": scaleDate
			};
			modules = ["interleaved2of5"];
			break;

		default:
			//res.status(404).send({ message: 'Unknown:' + code });
			return 'Unknown:' + codeDate
	}

	codes.loadModules(modules, bc_options);
	const bc = codes.create(codeDate, valueDate);
	const bc64 = Buffer.from(bc).toString('base64');
	// format output
	if (format === 'jpg') {
		gm(bc).toBuffer('JPG', function (err: Error, buffer: Buffer) {
			if (err) return handle(err);
			//res.type('image/jpeg');
			return bc64
		});
	} else {
		//res.status(200).send({ bc64: bc64 });
		return bc64
	}

}

function handle(err: Error) {
	throw new Error("Function not implemented.");
}
