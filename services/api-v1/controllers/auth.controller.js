'use strict'

//Paquetes de terceros
let bcryptjs = require('bcryptjs');
let moment = require('moment');
moment.locale('es');

let fileController = require('./file.controller');
let EmailController = require('./email.controller');
let constants = require('./../utilities/constants');

//Servicios
let _jwt = require('./../services/jwt.services');

let User;
let Config;
let Employee;
let EmployeeType;
let Company;
let Branch;
let Origin;
let Permission;
let CashBoxType;

function login(req, res, next) {

	//Recoger parametros
	let params = req.body;

	initConnectionDB(params.database);

	//Si existen estos datos, empezar a trabajar para loguear
	if (params.user && params.password) {

		let where;
		let json = '{"$and":[{"operationType": {"$ne": "D"}},';
		json = json + '{"$or":[{"name": "' + params.user + '"},';
		json = json + '{"email": "' + params.user + '"}]}]}';
		try {
			where = JSON.parse(json);
		} catch (err) {
			fileController.writeLog(req, res, next, 500, json);
			return res.status(500).send(constants.ERR_SERVER);
		}

		//Comprobar si existe el usuario
		User.findOne(where, function (err, user) {
			if (err) {
				return res.status(500).send('Error al comprobar el usuario');
			} else {
				if (!user) {
					return res.status(200).send({ message: 'El usuario y/o contraseña son incorrectos' });
				} else {
					//Comparar contraseñas
					comparePasswords(req, res, next, params.password, user);
				}
			}
		});
	} else {
		return res.status(200).send({ message: constants.COMPLETE_ALL_THE_DATA });
	}
}

function comparePasswords(req, res, next, password, user) {

	bcryptjs.compare(password, user.password)
		.then(function (arePasswordsEquals) {
			if (arePasswordsEquals) {
				if (user.state === "Habilitado") {
					User.findById(user._id, (err, user) => {
						if (err) {
							fileController.writeLog(req, res, next, 500, err);
							return res.status(500).send(constants.ERR_SERVER);
						} else {
							if (!user || user.operationType == 'D') {
								fileController.writeLog(req, res, next, 404, constants.NO_DATA_FOUND);
								return res.status(404).send(constants.NO_DATA_FOUND);
							} else {
								let token = _jwt.generateTokenSession(req, res, next, user);
                                user.token = token;
								fileController.writeLog(req, res, next, 200, user);
								return res.status(200).send({ user: user });
							}
						}
					}).populate({
						path: 'cashBoxType',
						model: CashBoxType
					}).populate({
						path: 'employee',
						model: Employee,
						populate: { path: 'type', model: EmployeeType }
					}).populate({
						path: 'company',
						model: Company
                    }).populate({
                        path: 'permission',
                        model: Permission,
                        match: { 'operationType': { $ne: "D" } },
                    }).populate({
						path: 'origin',
						model: Origin,
						populate: { path: 'branch', model: Branch }
					});
				} else {
					return res.status(200).send({ message: 'El usuario no se encuentra habilitado momentáneamente.', email: user.email, phone: user.phone });
				}
			} else {
				return res.status(200).send({ message: 'El usuario y/o contraseña son incorrectos' });
			}
		})
		.catch(function (err) {
			return res.status(200).send({ message: 'El usuario y/o contraseña son incorrectos' });
		});
}

function logout(req, res, next) {

	initConnectionDB(req.session.database);

	// let userId = req.query.id;
	// let user = req.body;

	// user.token = "";

	// user.updateDate = moment().format('YYYY-MM-DDTHH:mm:ssZ');
	// user.operationType = 'D';

	// User.findByIdAndUpdate(userId, user, (err, userUpdated) => {
	//     if (err) {
	// fileController.writeLog(req, res, next, 500, err);
	// return res.status(500).send(constants.ERR_SERVER);
	//     } else {
	//         return res.status(200).send({ user: userUpdated })
	//     }
	// });
}

async function getConfig(req, res, next) {

	return new Promise((resolve, reject) => {

		initConnectionDB(req.session.database);

		let config = new Config();

		Config.find().exec(async (err, configs) => {
			if (err) {
				reject(err);
			} else {
				if (!configs) {
					resolve(null);
				} else {
					config = configs[0];
					resolve(config);
				}
			}
		});
	});
}

async function forgotPassword(req, res, next) {

	initConnectionDB(req.session.database);

	let where = { email: req.query.email, operationType: { $ne: 'D' } };

	let user;
	let url = req.query.url;

	await getUsers(where).then(
		async users => {
			if (users && users.length > 0) {
				user = users[0];
			} else {
				return res.status(200).send({ message: "Email no registrado." });
			}
		}
	);

	if (user) {
		let config = await getConfig(req, res, next);
		let companyName = config.companyNamde;
		if (config.companyFantasyName) companyName = config.companyFantasyName;

		let token = _jwt.generateToken(req, req.query.email, 10, 'forgot-password');

		req.body = {
			subject: 'Instrucciones de recuperación de contraseña',
			body: `
            <div class="_3U2q6dcdZCrTrR_42Nxby JWNdg1hee9_Rz6bIGvG1c allowTextSelection">
            <div>
            <style type="text/css" style="box-sizing:border-box; margin:0; padding:0">
            </style> 
            <div class="rps_21ff"> 
            <div style="background:#F7F3ED; box-sizing:border-box; color:#000; font-family:'Barlow',sans-serif; font-size:16px; margin:0; overflow-x:hidden; padding:0"> 
            <div class="x_container" style="border:1px solid #EDECED; box-sizing:border-box; margin:50px auto; max-width:650px; padding:0; width:100%"> 
            <div class="x_reverse" style="box-sizing:border-box; margin:0; padding:0">
                <a href="${req.headers.origin}" target="_blank" rel="noopener noreferrer" data-auth="NotApplicable" style="box-sizing:border-box; color:#0275D8; font-weight:500; margin:0; padding:0; text-decoration:none"> 
                    <div class="x_logo" style="color:white; background-color:#0275D8; background-position:center; background-repeat:no-repeat; background-size:auto 24px; box-sizing:border-box; height:60px; margin:0; padding:15px; font-size: 30px;"> 
                        ${companyName}
                    </div>
                </a>
            </div> 
            <div class="x_main x_password-recovery-main" style="background:#fff; box-sizing:border-box; margin:0; padding:40px 38px; padding-top:14px; text-align:center">
            <h2 style="box-sizing:border-box; color:#0275D8; font-size:43px; font-weight:bold; line-height:1; margin:12px 0; margin-bottom:10px; padding:0">
                ¿Olvidaste tu contraseña?
            </h2>
            <h4 style="box-sizing:border-box; font-size:24px; font-weight:400; letter-spacing:-0.3; line-height:1.17; margin:0; padding:0">
                No te preocupes, es algo que nos pasa a todos.
            </h4> 
            <div class="x_generate-password" style="box-sizing:border-box; display:flex; margin:0 auto; padding:0; padding-top:40px; width:480px"> 
            <div class="x_generate-password__description" style="box-sizing:border-box; font-size:20px; letter-spacing:-0.25; line-height:1.25; margin:0; padding:0; text-align:left; width:55%"> 
            <span class="x_icon-arrow x_icon-arrow--inline x_icon-arrow--sm" style="background-repeat:no-repeat; background-size:contain; box-sizing:border-box; display:inline-block; height:17px; margin:0; padding:0; width:17px">
            </span> 
            <p style="box-sizing:border-box; margin:12px 0; padding:0; width:75%">
                <span style="box-sizing:border-box; margin:0; padding:0">
                    Puedes
                </span> 
                <span class="x_fw-600" style="box-sizing:border-box; font-weight:600; margin:0; padding:0">
                    generar una nueva
                </span> 
                <span style="box-sizing:border-box; margin:0; padding:0">
                    haciendo click en el siguiente botón:
                </span> 
            </p> 
            </div> 
            <div class="x_generate-password__button" style="box-sizing:border-box; margin:0; padding:0; padding-top:52px; width:45%">
            <a href="${req.headers.origin}/#/${(url) ? url : 'resetear-password'}?token=${token}" target="_blank" rel="noopener noreferrer" data-auth="NotApplicable" class="x_btn" style="background-color:#0275D8; border:none; border-radius:5px; box-sizing:border-box; color:#fff; display:inline-block; font-family:inherit; font-size:18px; font-weight:600; line-height:22px; margin:0; min-height:48px; min-width:206px; padding:12px; text-align:center; text-decoration:none; text-transform:uppercase">
                Generar
            </a>
            </div> 
            </div> 
            <div class="x_clarification" style="box-sizing:border-box; font-size:14px; line-height:1.07; margin:0 auto; padding:0; padding-top:6px; text-align:left; width:480px"> 
            <p style="box-sizing:border-box; margin:12px 0; padding:0">Si no solicitaste una nueva contraseña,
            puedes ignorar este mensaje y seguir ingresando al sistema tal como lo haces siempre.
            </p> 
            </div> 
            </div>
            </div>
            <p style="box-sizing:border-box; font-size:12px; font-weight:300; letter-spacing:normal; line-height:1.08; margin:12px 0; margin-top:20px; padding:0">
            <span style="box-sizing:border-box; margin:0; padding:0">Si necesitas ayuda no dudes en dirigirte a nuestra área de contacto en
            </span>
            <a href="${req.headers.origin}" target="_blank" rel="noopener noreferrer" data-auth="NotApplicable" style="box-sizing:border-box; color:#0275D8; font-weight:500; margin:0; padding:0; text-decoration:none"> ${req.headers.origin}
            </a>. 
            <span style="box-sizing:border-box; margin:0; padding:0">Para cualquier consulta puedes escribirnos a
            </span> 
            <a href="mailto:${config.emailAccount}" target="_blank" rel="noopener noreferrer" data-auth="NotApplicable" style="box-sizing:border-box; color:#0275D8; font-weight:500; margin:0; padding:0; text-decoration:none"> ${config.emailAccount}
            </a>.
            </span> 
            </p>
            <p style="box-sizing:border-box; font-size:12px; font-weight:300; letter-spacing:normal; line-height:1.08; margin:12px 0; margin-top:20px; padding:0; text-align: center;">
            <span style="box-sizing:border-box; margin:0; padding:0">Generado en <a href="http://www.poscloud.com.ar" target="_blank" rel="noopener noreferrer" data-auth="NotApplicable" style="box-sizing:border-box; color:#0275D8; font-weight:500; margin:0; padding:0; text-decoration:none">http://www.poscloud.com.ar</a>, tu Punto de Venta en la NUBE.
            </span>
            </p>
            </div> 
            </div> 
            </div> 
            </div>
            </div>         
            `,
			emails: req.query.email
		};

		EmailController.sendEmailClient(req, res, next);
	}
}

async function resetPassword(req, res, next) {

	let token = req.query.token;
	let password = req.query.password;

	const config = require('./../config.js');
	let jwt = require('jwt-simple');
	let payload;
	try {
		payload = jwt.decode(token, config.TOKEN_SECRET);
		if (payload.action !== 'forgot-password') {
			return res.status(200).send({ message: "El token ingresado es incorrecto." });
		}
	} catch (err) {
		return res.status(200).send({ message: "Se ha vencido el token, seleccione reenviar email." });
	}

	req.session = { database: payload.database };

	if (payload) {

		initConnectionDB(payload.database);

		let where = { email: payload.email, operationType: { $ne: 'D' } };

		let userUpdated;

		await getUsers(where).then(
			async users => {
				if (users && users.length > 0) {
					users[0].password = password;
					await updateUser(users[0]).then(
						user => {
							userUpdated = user;
						}
					).catch(
						err => {
							fileController.writeLog(req, res, next, 500, err);
							return res.status(200).send({ message: "Error al intentar actualizar la contraseña, inténtelo mas tarde." });
						}
					);
				} else {
					return res.status(200).send({ message: "Email no registrado." });
				}
			}
		).catch(
			err => {
				fileController.writeLog(req, res, next, 500, err);
				return res.status(200).send({ message: "Error al intentar actualizar la contraseña, inténtelo mas tarde." });
			}
		);

		if (userUpdated) {
			let config = await getConfig(req, res, next);
			let companyName = config.companyNamde;
			if (config.companyFantasyName) companyName = config.companyFantasyName;

			req.body = {
				subject: 'Cambio de contraseña',
				body: `
                <div class="_3U2q6dcdZCrTrR_42Nxby JWNdg1hee9_Rz6bIGvG1c allowTextSelection">
                <div>
                <style type="text/css" style="box-sizing:border-box; margin:0; padding:0">
                </style> 
                <div class="rps_21ff"> 
                <div style="background:#F7F3ED; box-sizing:border-box; color:#000; font-family:'Barlow',sans-serif; font-size:16px; margin:0; overflow-x:hidden; padding:0"> 
                <div class="x_container" style="border:1px solid #EDECED; box-sizing:border-box; margin:50px auto; max-width:650px; padding:0; width:100%"> 
                <div class="x_reverse" style="box-sizing:border-box; margin:0; padding:0">
                    <a href="${req.headers.origin}" target="_blank" rel="noopener noreferrer" data-auth="NotApplicable" style="box-sizing:border-box; color:#0275D8; font-weight:500; margin:0; padding:0; text-decoration:none"> 
                        <div class="x_logo" style="color:white; background-color:#0275D8; background-position:center; background-repeat:no-repeat; background-size:auto 24px; box-sizing:border-box; height:60px; margin:0; padding:15px; font-size: 30px;"> 
                            ${companyName}
                        </div>
                    </a>
                </div> 
                <div class="x_main x_password-recovery-main" style="background:#fff; box-sizing:border-box; margin:0; padding:40px 38px; padding-top:14px; text-align:center">
                <h2 style="box-sizing:border-box; color:#0275D8; font-size:43px; font-weight:bold; line-height:1; margin:12px 0; margin-bottom:10px; padding:0">
                    ¿Haz sido tú?
                </h2>
                <h4 style="box-sizing:border-box; font-size:24px; font-weight:400; letter-spacing:-0.3; line-height:1.17; margin:0; padding:0">
                    Se ha realizado un cambio de contraseña.
                </h4> 
                <div class="x_generate-password" style="box-sizing:border-box; display:flex; margin:0 auto; padding:0; padding-top:40px; width:480px"> 
                <div class="x_generate-password__description" style="box-sizing:border-box; font-size:20px; letter-spacing:-0.25; line-height:1.25; margin:0; padding:0; text-align:left; width:55%"> 
                <span class="x_icon-arrow x_icon-arrow--inline x_icon-arrow--sm" style="background-repeat:no-repeat; background-size:contain; box-sizing:border-box; display:inline-block; height:17px; margin:0; padding:0; width:17px">
                </span> 
                <p style="box-sizing:border-box; margin:12px 0; padding:0; width:100%">
                    <span style="box-sizing:border-box; margin:0; padding:0">
                        Si no haz sido tu, por favor contáctanos a ${config.emailAccount}
                    </span>
                </p> 
                </div> 
                </div> 
                </div>
                </div>
                <p style="box-sizing:border-box; font-size:12px; font-weight:300; letter-spacing:normal; line-height:1.08; margin:12px 0; margin-top:20px; padding:0">
                <span style="box-sizing:border-box; margin:0; padding:0">Si necesitas ayuda no dudes en dirigirte a nuestra área de contacto en
                </span>
                <a href="${req.headers.origin}" target="_blank" rel="noopener noreferrer" data-auth="NotApplicable" style="box-sizing:border-box; color:#0275D8; font-weight:500; margin:0; padding:0; text-decoration:none"> ${req.headers.origin}
                </a>. 
                <span style="box-sizing:border-box; margin:0; padding:0">Para cualquier consulta puedes escribirnos a
                </span> 
                <a href="mailto:${config.emailAccount}" target="_blank" rel="noopener noreferrer" data-auth="NotApplicable" style="box-sizing:border-box; color:#0275D8; font-weight:500; margin:0; padding:0; text-decoration:none"> ${config.emailAccount}
                </a>.
                </span> 
                </p>
                <p style="box-sizing:border-box; font-size:12px; font-weight:300; letter-spacing:normal; line-height:1.08; margin:12px 0; margin-top:20px; padding:0; text-align: center;">
                <span style="box-sizing:border-box; margin:0; padding:0">Generado en <a href="http://www.poscloud.com.ar" target="_blank" rel="noopener noreferrer" data-auth="NotApplicable" style="box-sizing:border-box; color:#0275D8; font-weight:500; margin:0; padding:0; text-decoration:none">http://www.poscloud.com.ar</a>, tu Punto de Venta en la NUBE.
                </span>
                </p>
                </div> 
                </div> 
                </div> 
                </div>
                </div>         
                `,
				emails: payload.email
			};

			EmailController.sendEmailClient(req, res, next);
		}
	}
}

function getUsers(where) {

	return new Promise((resolve, reject) => {

		//Controlo usuario existente
		User.find(where).exec((err, users) => {
			if (err) {
				reject(err);
			} else {
				resolve(users);
			}
		});
	});
}

function updateUser(user) {

	return new Promise((resolve, reject) => {

		//Encriptar la contraseña
		let bcryptjs_SALT_ROUNDS = 12;
		bcryptjs.hash(user.password, bcryptjs_SALT_ROUNDS)
			.then(function (hashedPassword) {

				//Guardar el usuario
				User.findByIdAndUpdate(user._id, { $set: { password: hashedPassword } }, (err, userUpdated) => {
					if (err) {
						reject(err);
					} else {
						resolve(userUpdated);
					}
				});
			})
			.catch(function (err) {
				reject(err);
			});
	});
}

function validateToken(req, res, next) {

	let config = require('./../config');
	let token = req.query.token;

	try {
		let jwt = require('jwt-simple');
		let payload = jwt.decode(token, config.TOKEN_SECRET);

		initConnectionDB(payload.database);

		User.findById(payload.user, function (err, user) {
			if (err) {
				return res.status(200).send(false);
			} else {
				return res.status(200).send(true);
			}
		});
	} catch (err) {
		return res.status(200).send(false);
	}
}

function initConnectionDB(database) {

	const Model = require('./../models/model');

	let EmployeeTypeSchema = require('./../models/employee-type');
	EmployeeType = new Model('employee-type', {
		schema: EmployeeTypeSchema,
		connection: database
	});

	let ConfigSchema = require('./../models/config');
	Config = new Model('config', {
		schema: ConfigSchema,
		connection: database
	});

	let EmployeeSchema = require('./../models/employee');
	Employee = new Model('employee', {
		schema: EmployeeSchema,
		connection: database
	});

	let CompanySchema = require('./../models/company');
	Company = new Model('company', {
		schema: CompanySchema,
		connection: database
	});

	let OriginSchema = require('./../models/origin');
	Origin = new Model('origin', {
		schema: OriginSchema,
		connection: database
	});

	let BranchSchema = require('./../models/branch');
	Branch = new Model('branch', {
		schema: BranchSchema,
		connection: database
	});

	let CashBoxTypeSchema = require('./../models/cash-box-type');
	CashBoxType = new Model('cash-box-type', {
		schema: CashBoxTypeSchema,
		connection: database
    });
    
    let PermissionSchema = require('./../models/permission');
	Permission = new Model('permission', {
		schema: PermissionSchema,
		connection: database
	});

	let UserSchema = require('./../models/user');
	User = new Model('user', {
		schema: UserSchema,
		connection: database
	});
}

module.exports = {
	login,
	logout,
	forgotPassword,
	validateToken,
	resetPassword
}