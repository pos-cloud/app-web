'use strict'

let fileController = require('./file.controller');
let constants = require('./../utilities/constants');

let moment = require('moment');
moment.locale('es');

let User;
let ObjectModel;
let Relation;
let params;

async function importXlsx(req, res, next) {

	params = req.body;

	if (params['model']) {
		initConnectionDB(req.session.database, params['model']);
	} else {
		fileController.writeLog(req, res, next, 200, { message: 'Se debe definir el modelo a importar' });
		return res.status(200).send({ message: 'Se debe definir el modelo a importar' });
	}

	let objectToImport = '{';
	for (let key in params) {
		if (params[key] != null &&
			key != 'model' &&
			key != 'filePath' &&
			key != '') {
			objectToImport = objectToImport + '"' + key + '":"' + params[key] + '",';
		}
	}
	objectToImport = objectToImport.slice(0, -1);
	objectToImport = objectToImport + '}';

	let order;
	try {
		order = JSON.parse(objectToImport);
	} catch (err) {
		fileController.writeLog(req, res, next, 500, err);
		return res.status(500).send(constants.ERR_SERVER);
	}

	let primaryKey = params['primaryKey'];
	
	if (!order[primaryKey] || order[primaryKey] === '') {
		fileController.writeLog(req, res, next, 200, { message: 'Se debe definir la columna ' + primaryKey.charAt(0).toUpperCase() + primaryKey.slice(1) });
		return res.status(200).send({ message: 'Se debe definir la columna ' + primaryKey.charAt(0).toUpperCase() + primaryKey.slice(1) });
	}

	let route = params['filePath'];
	if (!route) {
		fileController.writeLog(req, res, next, 200, { message: 'Se debe definir la ruta del archivo a importar' });
		return res.status(200).send({ message: 'Se debe definir la ruta del archivo a importar' });
	}

	let exceltojson = require("xlsx-to-json");

	try {
		exceltojson({
			input: route,
			output: null, //since we don't need output.json
			lowerCaseHeaders: true
		}, async (err, rows) => {
			if (err) {
				fileController.writeLog(req, res, next, 500, err);
				return res.status(500).send(constants.ERR_SERVER);
			} else {
				if (rows.length > 0) {
					let record = 0;
					let recordSaved = 0;
					let recordUpdated = 0;
					for (let i = 0; i < rows.length; i++) {

						let object = rows[i];
						let newObject = new ObjectModel();
						let propertyError;

						for (let property in order) {
							propertyError = property;
							if (object.hasOwnProperty(order[property])) {
								if (property != '' && property != undefined) {
									if (!property.includes("relation")) {
										if (object[order[property]] != '' && object[order[property]] != undefined && order[property] != '') {
											newObject[property] = object[order[property]];
											if (typeof newObject[property] === 'object') {
												if (newObject[property] instanceof Date) {
													if (moment(newObject[property]).isValid()) {
														newObject[property] = moment(newObject[property]).format('YYYY-MM-DDTHH:mm:ssZ');
													} else {
														let message = "Cantidad de registro importados " + record;
														message += ". Registro Nro " + (record + 1) + ": Error de datos en la columna " + order[property] + " con " + primaryKey.charAt(0).toUpperCase() + primaryKey.slice(1) + " = " + object[order[property]];
														message += "(Detalle de error: Fecha no válida)";
														fileController.writeLog(req, res, next, 200, { message: message });
														return res.status(200).send({ message: message });
													}
												}
											}
											if (!newObject[property]) {
												let message = "Cantidad de registro importados " + record;
												message += ". Registro Nro " + (record + 1) + ": Error de datos en la columna " + order[property] + " con valor " + object[order[property]];

												fileController.writeLog(req, res, next, 200, { message: message });
												return res.status(200).send({ message: message });
											}
										}
									} else {
										if (object[order[property]] != '' && object[order[property]] != undefined && order[property] != '') {
											let relations = property.split("_relation_");

											let relationName = relations[0];
											if (relationName.includes('-')) {
												relationName = toCamelCase(relationName);
											}

											if (ObjectModel["base"]["modelSchemas"][params['model']]["paths"][relationName]["instance"] == 'ObjectID') {
												initConnectionDB(req.session.database, (relations[1].includes("_")) ? relations[1].split("_")[1] : relations[0], 'rel');
											} else if (ObjectModel["base"]["modelSchemas"][params['model']]["paths"][relationName]["instance"] == 'Array') {
												initConnectionDB(req.session.database, ObjectModel["base"]["modelSchemas"][params['model']]["paths"][relationName]["caster"]["options"]["ref"], 'rel');
											}

											if (relationName.includes('-')) {
												relationName = toCamelCase(relationName);
											}

											let relation = new Relation();
											let propertyRelation = (relations[1].includes("_")) ? relations[1].split("_")[0] : relations[1];

											if (ObjectModel["base"]["modelSchemas"][params['model']]["paths"][relationName]["instance"] == 'String') {
												relation[propertyRelation] = object[order[property]].toString();
											} else {
												relation[propertyRelation] = object[order[property]];

											}
											let result = await getObject(Relation, relation, propertyRelation);

											if (result.err) {
												let message = "Cantidad de registro importados " + record;
												message += ". Registro Nro " + (record + 1) + ": Error de datos en la columna " + order[property] + " con " + primaryKey.charAt(0).toUpperCase() + primaryKey.slice(1) + " = " + object[order[property]];
												message += "(Detalle de error: " + result.err + ")";

												fileController.writeLog(req, res, next, 500, result.err);
												return res.status(500).send({ message: message });
											} else {
												if (result.object) {
													newObject[relationName] = result.object;
												} else {
													let user = new User();
													user._id = req.session.user;
													relation.creationUser = user;
													relation.creationDate = moment().format('YYYY-MM-DDTHH:mm:ssZ');
													relation.operationType = 'C';
													let resultSaved = await saveObject(relation);

													if (resultSaved.err) {
														let message = "Cantidad de registro importados " + record;
														message += ". Registro Nro " + (record + 1) + ": Error de datos en la columna " + order[property] + " con " + primaryKey.charAt(0).toUpperCase() + primaryKey.slice(1) + " = " + object[order[property]];
														message += "(Detalle de error: " + resultSaved.err + ")";

														fileController.writeLog(req, res, next, 500, resultSaved.err);
														return res.status(500).send(message);
													} else {
														if (ObjectModel["base"]["modelSchemas"][params['model']]["paths"][relationName]["instance"] == 'Array') {
															newObject[relationName] = new Array();
															newObject[relationName].push(resultSaved.object);
														} else {
															newObject[relationName] = resultSaved.object;
														}
													}
												}
											}
										}
									}
								}
							}
						}
						if ((!isNaN(newObject[primaryKey]) && newObject[primaryKey] !== 0) ||
							(isNaN(newObject[primaryKey]) && newObject[primaryKey] !== '')) {
							let result = await getObject(ObjectModel, newObject, primaryKey);
							if (result.err) {
								let message = "Cantidad de registro importados " + record;
								message += ". Registro Nro " + (record + 1) + ": Error de datos en la columna " + order[propertyError] + " con " + primaryKey.charAt(0).toUpperCase() + primaryKey.slice(1) + " = " + object[order[propertyError]];
								message += "(Detalle de error: " + result.err + ")";

								fileController.writeLog(req, res, next, 500, result.err);
								return res.status(500).send(message);
							} else {
								if (result.object) {
									newObject._id = result.object._id;
									let user = new User();
									user._id = req.session.user;
									newObject.updateUser = user;
									newObject.updateDate = moment().format('YYYY-MM-DDTHH:mm:ssZ');
									newObject.operationType = 'U';
									let resultUpdate = await updateObject(ObjectModel, newObject);
									if (resultUpdate.err) {
										let message = "Cantidad de registro importados " + record;
										message += ". Registro Nro " + (record + 1) + ": Error de datos en la columna " + order[propertyError] + " con " + primaryKey.charAt(0).toUpperCase() + primaryKey.slice(1) + " = " + object[order[propertyError]];
										message += "(Detalle de error: " + resultUpdate.err + ")";

										fileController.writeLog(req, res, next, 500, resultUpdate.err);
										return res.status(500).send(message);
									} else {
										record++;
										recordUpdated++;
									}
								} else {
									let user = new User();
									user._id = req.session.user;
									newObject.creationUser = user;
									newObject.creationDate = moment().format('YYYY-MM-DDTHH:mm:ssZ');
									newObject.operationType = 'C';
									let resultSaved = await saveObject(newObject);
									if (resultSaved.err) {
										let message = "Cantidad de registro importados " + record;
										message += ". Registro Nro " + (record + 1) + ": Error de datos en la columna " + order[propertyError] + " con " + primaryKey.charAt(0).toUpperCase() + primaryKey.slice(1) + " = " + object[order[propertyError]];
										message += "(Detalle de error: " + resultSaved.err + ")";

										fileController.writeLog(req, res, next, 500, resultSaved.err);
										return res.status(500).send(message);
									} else {
										record++;
										recordSaved++;
									}
								}
							}
						}
					}
					fileController.writeLog(req, res, next, 200, record);
					return res.status(200).send({ records: record, recordSaved: recordSaved, recordUpdated: recordUpdated });
				} else {
					fileController.writeLog(req, res, next, 200, 'No se ha definido el modelo de excel a importar.');
					return res.status(200).send({ message: 'No se ha definido el modelo de excel a importar.' });
				}
			}
		});
	} catch (err) {
		fileController.writeLog(req, res, next, 500, err);
		return res.status(500).send(err);
	}
}

function toCamelCase(str) {
	return str.split('-').map(function (word, index) {
		if (index == 0) {
			return word.toLowerCase();
		}
		return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
	}).join('');
}

function getObject(ObjectModel, object, primaryKey) {


	return new Promise((resolve, reject) => {

		let json;
        /*if (ObjectModel["base"]["modelSchemas"][params['model']]["paths"][primaryKey]["instance"] !== 'String') {
            json = '{"' + primaryKey + '":' + object[primaryKey] + '}';
        } else {
            json = '{"' + primaryKey + '":"' + object[primaryKey] + '"}';
        }*/

		json = '{"' + primaryKey + '":"' + object[primaryKey] + '"}';

		let where;
		try {
			where = JSON.parse(json);
		} catch (err) {
			reject({ err: err });
		}

		ObjectModel.find(where)
			.exec((err, models) => {
				if (err) {
					reject({ err: err });
				} else {
					let objectAux;
					if (!models) {
						objectAux = null;
					} else if (models.length === 0) {
						objectAux = null;
					} else {
						objectAux = models[0];
					}
					resolve({ object: objectAux });
				}
			});
	});
}

function saveObject(object) {
	return new Promise((resolve, reject) => {
		object.save((err, modelSaved) => {
			if (err) {
				reject({ err: err });
			} else {
				resolve({ object: modelSaved });
			}
		});
	});
}

function updateObject(ObjectModel, object) {
	return new Promise((resolve, reject) => {

		ObjectModel.findByIdAndUpdate(object._id, object, (err, modelUpdated) => {
			if (err) {
				reject({ err: err });
			} else {
				resolve({ object: modelUpdated });
			}
		});
	});
}

function initConnectionDB(database, model, type = "obj") {

	const Model = require('./../models/model');

	if (type === "obj") {
		let ObjectModelSchema = require('./../models/' + model);
		ObjectModel = new Model(model, {
			schema: ObjectModelSchema,
			connection: database
		});
	}

	if (type === "rel") {
		let RelationSchema = require('./../models/' + model);
		Relation = new Model(model, {
			schema: RelationSchema,
			connection: database
		});
	}

	let UserSchema = require('./../models/user');
	User = new Model('user', {
		schema: UserSchema,
		connection: database
	});
}

module.exports = {
	importXlsx
}