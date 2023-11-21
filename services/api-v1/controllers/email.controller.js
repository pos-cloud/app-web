'use strict';

const nodemailer = require('nodemailer');
let Config;

//https://nodemailer.com/about/

//https://ourcodeworld.com/articles/read/264/how-to-send-an-email-gmail-outlook-and-zoho-using-nodemailer-in-node-js

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

async function sendEmailClient(req, res, next) {

	initConnectionDB(req.session.database);

	let params = req.body;

	let config = await getConfig(req, res, next);

	if (config && config.emailAccount && config.emailPassword && config.emailHost && config.emailPort) {

		await sendEmail(req, res, next, params.subject, params.body, params.attachments, params.emails, config.emailAccount, config.emailPassword, config.emailHost, config.emailPort).then(
			result => {
				return res.status(200).send(result);
			}
		).catch(
			err => {
				return res.status(500).send(err);
			}
		);
	} else {
		return res.status(200).send({ message: "Debe configurar su cuenta de correo en Configuraciones->Generales" });
	}
}

async function sendEmail(req, res, next, subject, message, attachments, emailReceiver, emailSender = 'info@poscloud.com.ar', password = 'OKU17/K4tD', host = 'vps-1891670-x.dattaweb.com', port = 465) {

	return new Promise((resolve, reject) => {

		nodemailer.createTestAccount((err, account) => {

			if(err) reject(err);
			
			let transporter = nodemailer.createTransport({
					host: host,
					port : port,
					auth: {
						user: emailSender,
						pass: password
					}
				});

			let mailOptions = {
				from: '<' + emailSender + '>', // sender address
				to: emailReceiver, // list of receivers
				subject: subject, // Subject line
				html: message, // html body,
				// attachments:[{
				// 	filename: 'asd',
				// 	path: '/home/clients/demo/others/60ad49f830869f5d3e9a4a7f.pdf'
				// }]
				attachments: attachments
			};

			transporter.sendMail(mailOptions, (err, info) => {
				if (err) {
					req.body.claim = {
						name: `Error al enviar email`,
						description: err + `- Auth: user:${emailSender}, pass:${password}, mailOptions: ${JSON.stringify(mailOptions)}`,
						listName: 'ERRORES 500'
					};
					reject(err);
				} else {
					resolve(info);
				}
			});
		});
	});
}

async function sendEmailToClient(req, res, next) {

	initConnectionDB(req.session.database);

	let params = req.body;

    let config = await getConfig(req, res, next);

	if (config && config.emailAccount) {
		sendEmail(req, res, next, params.subject, params.message, params.attachments, config.emailAccount).then(
			result => {
				if (result) {
					return res.status(200).send(result);
				}
			}
		).catch(
			err => {
				return res.status(500).send(err);
			}
		);
	} else {
		return res.status(200).send({ message: "Debe configurar su cuenta de correo en Configuraciones->Generales" });
	}
}

function contactMe(req, res, next) {

	let params = req.body;

	let message = `
	<div class="_3U2q6dcdZCrTrR_42Nxby JWNdg1hee9_Rz6bIGvG1c allowTextSelection">
						<div>
						<style type="text/css" style="box-sizing:border-box; margin:0; padding:0">
						</style>
						<div class="rps_21ff">
						<div style="background:#F7F3ED; box-sizing:border-box; color:#000; font-family:"Barlow",sans-serif; font-size:16px; margin:0; overflow-x:hidden; padding:0">
						<div class="x_container" style="border:1px solid #EDECED; box-sizing:border-box; margin:50px auto; max-width:650px; padding:0; width:100%">
						<div class="x_reverse" style="box-sizing:border-box; margin:0; padding:0">
							<a href="http://poscloud.com.ar/" target="_blank" rel="noopener noreferrer" data-auth="NotApplicable" style="box-sizing:border-box; color:#0275D8; font-weight:500; margin:0; padding:0; text-decoration:none">
								<div class="x_logo" style="color:white; background-color:#0275D8; background-position:center; background-repeat:no-repeat; background-size:auto 24px; box-sizing:border-box; height:60px; margin:0; padding:15px; font-size: 30px;">
									POS Cloud
								</div>
							</a>
						</div>
						<div class="x_main x_password-recovery-main" style="background:#fff; box-sizing:border-box; margin:0; padding:40px 38px; padding-top:14px; text-align:center">
						<h2 style="box-sizing:border-box; color:#0275D8; font-size:43px; font-weight:bold; line-height:1; margin:12px 0; margin-bottom:10px; padding:0">
							Consulta Realizada.
						</h2>
						<h4 style="box-sizing:border-box; font-size:24px; font-weight:400; letter-spacing:-0.3; line-height:1.17; margin:0; padding:0">
							Los datos de la consulta son:
						</h4>
						</div>
						<div class="x_main x_password-recovery-main" style="background:#fff; box-sizing:border-box; margin:0; padding:40px 38px; padding-top:14px; text-align:left">
						<h3>
							<div>Nombre: ${params.name}<div>
							<div>E-mail: ${params.email}<div>
							<div>Teléfono: ${params.phone}<div>
							<div>Mensaje: ${params.message}<div>
						</h3>
						</div>
						<div class="x_generate-password" style="box-sizing:border-box; display:flex; margin:0 auto; padding-top:20px; padding-bottom:20px;">
						<div class="x_generate-password__description" style="box-sizing:border-box; font-size:20px; letter-spacing:-0.25; line-height:1.25; margin:0; padding:0; text-align:left;">
						<span class="x_icon-arrow x_icon-arrow--inline x_icon-arrow--sm" style="background-repeat:no-repeat; background-size:contain; box-sizing:border-box; display:inline-block; height:17px; margin:0; padding:0; width:17px">
						</span>
						</div>
						</div>
						<hr>
						</div>
						</div>
						<p style="box-sizing:border-box; font-size:12px; font-weight:300; letter-spacing:normal; line-height:1.08; margin:12px 0; margin-top:20px; padding:0">
						<span style="box-sizing:border-box; margin:0; padding:0">Si necesitas ayuda no dudes en dirigirte a nuestra área de contacto en
						</span>
						<a href="http://poscloud.com.ar/" target="_blank" rel="noopener noreferrer" data-auth="NotApplicable" style="box-sizing:border-box; color:#0275D8; font-weight:500; margin:0; padding:0; text-decoration:none"> http://poscloud.com.ar/
						</a>.
						<span style="box-sizing:border-box; margin:0; padding:0">Para cualquier consulta puedes escribirnos a
						</span>
						<a href="mailto:info@poscloud.com.ar" target="_blank" rel="noopener noreferrer" data-auth="NotApplicable" style="box-sizing:border-box; color:#0275D8; font-weight:500; margin:0; padding:0; text-decoration:none"> info@poscloud.com.ar
						</a>.
						</span>
						</p>
						<p style="box-sizing:border-box; font-size:12px; font-weight:300; letter-spacing:normal; line-height:1.08; margin:12px 0; margin-top:20px; padding:0; text-align: center;">
						</p>
						</div>
						</div>
						</div>
						</div>
						</div>
	`;

	sendEmail(req, res, next, 'Consulta Realizada', message, null, 'info@poscloud.com.ar').then(
		result => {
			if (result) {
				return res.status(200).send(result);
			}
		}
	).catch(
		err => {
			return res.status(500).send(err);
		}
	);
}

function initConnectionDB(database) {

	const Model = require('./../models/model');

	let ConfigSchema = require('./../models/config');
	Config = new Model('config', {
		schema: ConfigSchema,
		connection: database
	});
}

module.exports = {
	sendEmail,
	sendEmailClient,
	sendEmailToClient,
	contactMe
}