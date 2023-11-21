'use strict'

let fs = require('fs');
let fileController = require('./file.controller');

let UglifyJS = require("uglify-es");

// function uglify(req, res, next) {

// 	//CONTROLLERS
// 	let controllersFiles = {
// 		"article.controller.min.js": fs.readFileSync("./controllers/article.controller.js", "utf8"),
// 		"cash-box.controller.min.js": fs.readFileSync("./controllers/cash-box.controller.js", "utf8"),
// 		"category.controller.min.js": fs.readFileSync("./controllers/category.controller.js", "utf8"),
// 		"company.controller.min.js": fs.readFileSync("./controllers/company.controller.js", "utf8"),
// 		"config.controller.min.js": fs.readFileSync("./controllers/config.controller.js", "utf8"),
// 		"email.controller.min.js": fs.readFileSync("./controllers/email.controller.js", "utf8"),
// 		"employee-type.controller.min.js": fs.readFileSync("./controllers/employee-type.controller.js", "utf8"),
// 		"employee.controller.min.js": fs.readFileSync("./controllers/employee.controller.js", "utf8"),
// 		"import.controller.min.js": fs.readFileSync("./controllers/import.controller.js", "utf8"),
// 		"license.controller.min.js": fs.readFileSync("./controllers/license.controller.js", "utf8"),
// 		"make.controller.min.js": fs.readFileSync("./controllers/make.controller.js", "utf8"),
// 		"movement-of-article.controller.min.js": fs.readFileSync("./controllers/movement-of-article.controller.js", "utf8"),
// 		"movement-of-cash.controller.min.js": fs.readFileSync("./controllers/movement-of-cash.controller.js", "utf8"),
// 		"payment-method.controller.min.js": fs.readFileSync("./controllers/payment-method.controller.js", "utf8"),
// 		"print.controller.min.js": fs.readFileSync("./controllers/print.controller.js", "utf8"),
// 		"printer.controller.min.js": fs.readFileSync("./controllers/printer.controller.js", "utf8"),
// 		"room.controller.min.js": fs.readFileSync("./controllers/room.controller.js", "utf8"),
// 		"table.controller.min.js": fs.readFileSync("./controllers/table.controller.js", "utf8"),
// 		"transaction-type.controller.min.js": fs.readFileSync("./controllers/transaction-type.controller.js", "utf8"),
// 		"transaction.controller.min.js": fs.readFileSync("./controllers/transaction.controller.js", "utf8"),
// 		"turn.controller.min.js": fs.readFileSync("./controllers/turn.controller.js", "utf8"),
// 		"user.controller.min.js": fs.readFileSync("./controllers/user.controller.js", "utf8")
// 	}

// 	//MIDDLEWARES
// 	let middlewaresFiles = {
// 		"auth.middleware.min.js": fs.readFileSync("./middlewares/auth.middleware.js", "utf8"),
// 		"check-permission.middleware.min.js": fs.readFileSync("./middlewares/check-permission.middleware.js", "utf8"),
// 		"license.middleware.min.js": fs.readFileSync("./middlewares/license.middleware.js", "utf8"),
// 	}

// 	//MODELS
// 	let modelsFiles = {
// 		"article.min.js": fs.readFileSync("./models/article.js", "utf8"),
// 		"cash-box.min.js": fs.readFileSync("./models/cash-box.js", "utf8"),
// 		"category.min.js": fs.readFileSync("./models/category.js", "utf8"),
// 		"company.min.js": fs.readFileSync("./models/company.js", "utf8"),
// 		"config.min.js": fs.readFileSync("./models/config.js", "utf8"),
// 		"employee-type.min.js": fs.readFileSync("./models/employee-type.js", "utf8"),
// 		"employee.min.js": fs.readFileSync("./models/employee.js", "utf8"),
// 		"make.min.js": fs.readFileSync("./models/make.js", "utf8"),
// 		"movement-of-article.min.js": fs.readFileSync("./models/movement-of-article.js", "utf8"),
// 		"movement-of-cash.min.js": fs.readFileSync("./models/movement-of-cash.js", "utf8"),
// 		"payment-method.min.js": fs.readFileSync("./models/payment-method.js", "utf8"),
// 		"print.min.js": fs.readFileSync("./models/print.js", "utf8"),
// 		"printer.min.js": fs.readFileSync("./models/printer.js", "utf8"),
// 		"room.min.js": fs.readFileSync("./models/room.js", "utf8"),
// 		"table.min.js": fs.readFileSync("./models/table.js", "utf8"),
// 		"transaction-type.min.js": fs.readFileSync("./models/transaction-type.js", "utf8"),
// 		"transaction.min.js": fs.readFileSync("./models/transaction.js", "utf8"),
// 		"turn.min.js": fs.readFileSync("./models/turn.js", "utf8"),
// 		"user.min.js": fs.readFileSync("./models/user.js", "utf8")
// 	}

// 	//ROUTES
// 	let routesFiles = {
// 		"article.routes.min.js": fs.readFileSync("./routes/article.routes.js", "utf8"),
// 		"cash-box.routes.min.js": fs.readFileSync("./routes/cash-box.routes.js", "utf8"),
// 		"category.routes.min.js": fs.readFileSync("./routes/category.routes.js", "utf8"),
// 		"company.routes.min.js": fs.readFileSync("./routes/company.routes.js", "utf8"),
// 		"config.routes.min.js": fs.readFileSync("./routes/config.routes.js", "utf8"),
// 		"email.routes.min.js": fs.readFileSync("./routes/email.routes.js", "utf8"),
// 		"employee-type.routes.min.js": fs.readFileSync("./routes/employee-type.routes.js", "utf8"),
// 		"employee.routes.min.js": fs.readFileSync("./routes/employee.routes.js", "utf8"),
// 		"import.routes.min.js": fs.readFileSync("./routes/import.routes.js", "utf8"),
// 		"license.routes.min.js": fs.readFileSync("./routes/license.routes.js", "utf8"),
// 		"make.routes.min.js": fs.readFileSync("./routes/make.routes.js", "utf8"),
// 		"movement-of-article.routes.min.js": fs.readFileSync("./routes/movement-of-article.routes.js", "utf8"),
// 		"movement-of-cash.routes.min.js": fs.readFileSync("./routes/movement-of-cash.routes.js", "utf8"),
// 		"payment-method.routes.min.js": fs.readFileSync("./routes/payment-method.routes.js", "utf8"),
// 		"print.routes.min.js": fs.readFileSync("./routes/print.routes.js", "utf8"),
// 		"printer.routes.min.js": fs.readFileSync("./routes/printer.routes.js", "utf8"),
// 		"room.routes.min.js": fs.readFileSync("./routes/room.routes.js", "utf8"),
// 		"table.routes.min.js": fs.readFileSync("./routes/table.routes.js", "utf8"),
// 		"transaction-type.routes.min.js": fs.readFileSync("./routes/transaction-type.routes.js", "utf8"),
// 		"transaction.routes.min.js": fs.readFileSync("./routes/transaction.routes.js", "utf8"),
// 		"turn.routes.min.js": fs.readFileSync("./routes/turn.routes.js", "utf8"),
// 		"user.routes.min.js": fs.readFileSync("./routes/user.routes.js", "utf8")
// 	}

// 	//SERVICES
// 	let servicesFiles = {
// 		"jwt.services.min.js": fs.readFileSync("./services/jwt.services.js", "utf8"),
// 	}

// 	// let result = UglifyJS.minify(fs.readFileSync("./controllers/user.controller.js", "utf8"));
// 	let resultControllersFiles = UglifyJS.minify(controllersFiles);
// 	let resultMiddlewaresFiles = UglifyJS.minify(middlewaresFiles);
// 	let resultModelsFiles = UglifyJS.minify(modelsFiles);
// 	let resultRoutesFiles = UglifyJS.minify(routesFiles);
// 	let resultServicesFiles = UglifyJS.minify(servicesFiles);

// 	if (resultControllersFiles.err || 
// 		resultMiddlewaresFiles.err ||
// 		resultModelsFiles.err ||
// 		resultRoutesFiles.err ||
// 		resultServicesFiles.err) {
// 		 // runtime err, or `undefined` if no err
// 		return res.status(500).send("Error al minificar");
// 	} else {
// 		fs.writeFileSync("./dist/controllers/produccion.min.js",
// 			resultControllersFiles.code,
// 			"utf8");
// 		fs.writeFileSync("./dist/middlewares/produccion.min.js",
// 			resultMiddlewaresFiles.code,
// 			"utf8");
// 		fs.writeFileSync("./dist/models/produccion.min.js",
// 			resultModelsFiles.code,
// 			"utf8");
// 		fs.writeFileSync("./dist/routes/produccion.min.js",
// 			resultRoutesFiles.code,
// 			"utf8");
// 		fs.writeFileSync("./dist/services/produccion.min.js",
// 			resultServicesFiles.code,
// 			"utf8");
// 		return res.status(200).send("Éxito al minificar");
// 	}
// }

function uglify(req, res, next) {

	fs.mkdirSync("./../dist/");
	fs.mkdirSync("./../dist/controllers");
	fs.mkdirSync("./../dist/libs");
	fs.mkdirSync("./../dist/lic");
	fs.mkdirSync("./../dist/middlewares");
	fs.mkdirSync("./../dist/models");
	fs.mkdirSync("./../dist/routes");
	fs.mkdirSync("./../dist/services");
	fs.mkdirSync("./../dist/upload");
	fs.mkdirSync("./../dist/upload/article");
	fs.mkdirSync("./../dist/upload/category");

	let controllers = ["article", "cash-box", "category", "company", "config", "email",
		"employee-type", "employee", "file", "import", "license", "make", "movement-of-article",
		"movement-of-cash", "payment-method", "print", "printer", "room", "table", "transaction-type",
		"transaction", "turn", "user", "utilities", "vat-condition"];

	let middlewares = ["auth", "check-permission", "license"];

	let models = ["article", "cash-box", "category", "code-afip", "company", "config", "employee-type",
		"employee", "make", "movement-of-article", "movement-of-cash", "payment-method", "print",
		"printer", "room", "table", "transaction-tax", "transaction-type", "transaction", "turn", "user",
		"vat-condition"];

	let routes = ["article", "cash-box", "category", "company", "config", "email", "employee-type",
		"employee", "file", "import", "license", "make", "movement-of-article", "movement-of-cash",
		"payment-method", "print", "printer", "room", "table", "transaction-type", "transaction",
		"turn", "user", "utilities", "vat-condition"];

	let services = ["jwt"];

	let root = ["app.js", "config.js", "index.js"];

	for (let i in controllers) {
		let result = UglifyJS.minify(fs.readFileSync("./controllers/" + controllers[i] + ".controller.js", "utf8"));

		if (result.err) {
			return res.status(200).send("Ha ocurrido un err al minificar el archivo " + controllers[i] + ".controller.js. Detalle de err: " + result.err);
		} else {
			fs.writeFileSync("./../dist/controllers/" + controllers[i] + ".controller.js",
				result.code,
				"utf8");
		}
	}

	for (let i in middlewares) {
		let result = UglifyJS.minify(fs.readFileSync("./middlewares/" + middlewares[i] + ".middleware.js", "utf8"));

		if (result.err) {
			return res.status(200).send("Ha ocurrido un err al minificar el archivo " + middlewares[i] + ".middleware.js. Detalle de err: " + result.err);
		} else {
			fs.writeFileSync("./../dist/middlewares/" + middlewares[i] + ".middleware.js",
				result.code,
				"utf8");
		}
	}

	for (let i in models) {
		let result = UglifyJS.minify(fs.readFileSync("./models/" + models[i] + ".js", "utf8"));

		if (result.err) {
			return res.status(200).send("Ha ocurrido un err al minificar el archivo " + models[i] + ".js. Detalle de err: " + result.err);
		} else {
			fs.writeFileSync("./../dist/models/" + models[i] + ".js",
				result.code,
				"utf8");
		}
	}

	for (let i in routes) {
		let result = UglifyJS.minify(fs.readFileSync("./routes/" + routes[i] + ".routes.js", "utf8"));

		if (result.err) {
			return res.status(200).send("Ha ocurrido un err al minificar el archivo " + routes[i] + ".routes.js. Detalle de err: " + result.err);
		} else {
			fs.writeFileSync("./../dist/routes/" + routes[i] + ".routes.js",
				result.code,
				"utf8");
		}
	}

	for (let i in services) {
		let result = UglifyJS.minify(fs.readFileSync("./services/" + services[i] + ".services.js", "utf8"));

		if (result.err) {
			return res.status(200).send("Ha ocurrido un err al minificar el archivo " + services[i] + ".services.js. Detalle de err: " + result.err);
		} else {
			fs.writeFileSync("./../dist/services/" + services[i] + ".services.js",
				result.code,
				"utf8");
		}
	}

	for (let i in root) {
		let result = UglifyJS.minify(fs.readFileSync("./" + root[i], "utf8"));

		if (result.err) {
			return res.status(200).send("Ha ocurrido un err al minificar el archivo " + root[i] + ". Detalle de err: " + result.err);
		} else {
			fs.writeFileSync("./../dist/" + root[i],
				result.code,
				"utf8");
		}
	}

	copyFile("./package-lock.json", "./../dist/");
	copyFile("./package.json", "./../dist/");
	copyFile("./libs", "./../dist/libs");
	copyFile("./lic/lic.txt", "./../dist/lic");
	copyFile("./upload", "./../dist/upload");

	return res.status(200).send("Éxito al minificar");
}

//copy the $file to $dir2
function copyFile(file, dir2) {
	//include the fs, path modules
	let fs = require('fs');
	let path = require('path');

	//gets file name and adds it to dir2
	let f = path.basename(file);
	let source = fs.createReadStream(file);
	let dest = fs.createWriteStream(path.resolve(dir2, f));

	source.pipe(dest);
	source.on('end', function () { console.log('Succesfully copied'); });
	source.on('err', function (err) { console.log(err); });
};

module.exports = {
	uglify
}