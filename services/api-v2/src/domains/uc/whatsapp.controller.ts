import * as express from 'express';
//import * as twilio from 'twilio';
import Responseable from '../../interfaces/responsable.interface';
import ConfigController from '../config/config.controller';
import Responser from '../../utils/responser';
import HttpException from '../../exceptions/HttpException';
import RequestWithUser from '../../interfaces/requestWithUser.interface';
import authMiddleware from '../../middleware/auth.middleware';
import ensureLic from '../../middleware/license.middleware';
/*
export default class WhatsappController {

	public path = '/whatsapp/';
	public router = express.Router();
	public database: string;

	constructor(database: string) {
		this.database = database;
		this.initializeRoutes();
	}

	private initializeRoutes() {
		this.router.post(`${this.path}send-message`, [authMiddleware, ensureLic], this.sendMessage);
	}

	private sendMessage = async (
		request: RequestWithUser,
		response: express.Response,
		next: express.NextFunction
	) => {

		const body: string = request.body.message;
		if (!body || body === '') {
			next(new HttpException(new Responser(400, null, 'the body field is required', 'the body field is required')));
		}

		const receiverNumber: string = request.body.receiverNumber;
		if (!receiverNumber || receiverNumber === '') {
			next(new HttpException(new Responser(400, null, 'the receiver number field is required', 'the receiver number field is required')));
		}

		await new ConfigController(request.database).getAll({ limit: 1 })
			.then(async (result: Responseable) => {
				if (result.status === 200 && result.result.length > 0) {
					const config = result.result[0];
					if (config && config.twilio && config.twilio.accountSid && config.twilio.authToken) {
						const senderNumber: string = config.twilio.senderNumber;
						const accountSid: string = config.twilio.accountSid;
						const authToken: string = config.twilio.authToken;
						const ws = twilio(accountSid, authToken);

						ws.messages
							.create({
								from: 'whatsapp:' + senderNumber,
								body: body,
								to: 'whatsapp:' + receiverNumber
							})
							.then((result: any) => {
								response.send(new Responser(200, result));
							})
							.catch((error: any) => next(new HttpException(new Responser(500, null, error.message, error))));
					} else next(new HttpException(new Responser(400, null, 'whatsApp settings are required', 'whatsApp settings are required')));
				} else {
					next(new HttpException(new Responser(result.status, null, result.message, result)));
				}
			})
			.catch(error => next(new HttpException(new Responser(500, null, error.message, error))));
	}
}
*/