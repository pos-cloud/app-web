import * as express from 'express'
//import * as twilio from 'twilio'

import HttpException from '../../exceptions/HttpException'
import RequestWithUser from '../../interfaces/requestWithUser.interface'
import Responseable from '../../interfaces/responsable.interface'
import authMiddleware from '../../middleware/auth.middleware'
import ensureLic from '../../middleware/license.middleware'
import Responser from '../../utils/responser'
import ConfigController from '../config/config.controller'

/*
export default class SMSController {
  public path = '/sms/'
  public router = express.Router()
  public database: string

  constructor(database: string) {
    this.database = database
    this.initializeRoutes()
  }

  private initializeRoutes() {
    this.router.post(`${this.path}send`, [authMiddleware, ensureLic], this.send)
  }

  public send = async (
    request: RequestWithUser,
    response: express.Response,
    next: express.NextFunction,
  ) => {
    this.database = request.database

    const message: string = request.body.message

    if (!message || message === '') {
      next(
        new HttpException(
          new Responser(
            400,
            null,
            'the message field is required',
            'the message field is required',
          ),
        ),
      )
    }

    const receiverNumber: string = request.body.receiverNumber

    if (!receiverNumber || receiverNumber === '') {
      next(
        new HttpException(
          new Responser(
            400,
            null,
            'the receiver number field is required',
            'the receiver number field is required',
          ),
        ),
      )
    }

    await this.sendMessage(message, receiverNumber)
      .then(async (result: Responseable) => {
        if (result.status === 200) {
          response.send(result)
        } else {
          next(
            new HttpException(new Responser(result.status, null, result.message, result)),
          )
        }
      })
      .catch((error) =>
        next(new HttpException(new Responser(500, null, error.message, error))),
      )
  }

  public sendMessage = async (message: string, receiverNumber: string) => {
    return new Promise(async (resolve, reject) => {
      if (!message || message === '') {
        reject(
          new HttpException(
            new Responser(
              400,
              null,
              'the message field is required',
              'the message field is required',
            ),
          ),
        )
      }

      if (!receiverNumber || receiverNumber === '') {
        reject(
          new HttpException(
            new Responser(
              400,
              null,
              'the receiver number field is required',
              'the receiver number field is required',
            ),
          ),
        )
      }

      await new ConfigController(this.database)
        .getAll({limit: 1})
        .then(async (result: Responseable) => {
          if (result.status === 200 && result.result.length > 0) {
            const config = result.result[0]

            if (
              config &&
              config.twilio &&
              config.twilio.accountSid &&
              config.twilio.authToken
            ) {
              const senderNumber: string = config.twilio.senderNumber
              const accountSid: string = config.twilio.accountSid
              const authToken: string = config.twilio.authToken
              const ws = twilio(accountSid, authToken)

              ws.messages
                .create({
                  from: senderNumber,
                  body: message,
                  to: receiverNumber,
                })
                .then((result: any) => {
                  resolve(new Responser(200, result))
                })
                .catch((error: any) =>
                  reject(
                    new HttpException(new Responser(500, null, error.message, error)),
                  ),
                )
            } else
              reject(
                new HttpException(
                  new Responser(
                    400,
                    null,
                    'sms settings are required',
                    'sms settings are required',
                  ),
                ),
              )
          } else {
            reject(
              new HttpException(
                new Responser(result.status, null, result.message, result),
              ),
            )
          }
        })
        .catch((error) =>
          reject(new HttpException(new Responser(500, null, error.message, error))),
        )
    })
  }
}
*/
