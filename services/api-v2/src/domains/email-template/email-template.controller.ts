import * as express from 'express'
import RequestWithUser from './../../interfaces/requestWithUser.interface'

import Controller from '../model/model.controller'

import authMiddleware from './../../middleware/auth.middleware'
import ensureLic from './../../middleware/license.middleware'
import validationMiddleware from './../../middleware/validation.middleware'
import ObjDto from './email-template.dto'
import ObjSchema, { bodyMail } from './email-template.model'
import HttpException from './../../exceptions/HttpException'
import Responser from './../../utils/responser'
import EmailUC from './email.uc'
import ConfigController from './../../domains/config/config.controller'
import Config from './../../domains/config/config.interface'
import Responseable from './../../interfaces/responsable.interface'

export default class EmailTemplateController extends Controller {
  public EJSON: any = require('bson').EJSON
  public path = ObjSchema.getPath()
  public router = express.Router()
  public obj: any

  constructor(database: string) {
    super(ObjSchema, ObjDto, database)
    this.initializeRoutes()
  }

  private initializeRoutes() {
    this.router
      .get(this.path, [authMiddleware, ensureLic], this.getAllObjs)
      .get(`${this.path}/:id`, [authMiddleware, ensureLic], this.getObjById)
      .post(
        this.path,
        [authMiddleware, ensureLic, validationMiddleware(ObjDto)],
        this.saveObj,
      )
      .post(
        `${this.path}/send-email`,
        [authMiddleware, ensureLic],
        this.sendMail,
      )
      .put(
        `${this.path}/:id`,
        [authMiddleware, ensureLic, validationMiddleware(ObjDto)],
        this.updateObj,
      )
      .delete(`${this.path}/:id`, [authMiddleware, ensureLic], this.deleteObj)
  }

  sendMail = async (
    request: RequestWithUser,
    response: express.Response,
    next: express.NextFunction,
  ) => {
    try {
      this.initConnectionDB(request.database)
      this.userAudit = request.user

      let config: Config;

      await new ConfigController(this.database)
      .getAll({match: {operationType: {$ne: 'D'}}})
      .then(async (result: Responseable) => (config = result.result[0]))

      const smtp = {
        host : config.emailHost,
        port: config.emailPort,
        auth : {
          user: config.emailAccount,
          pass: config.emailPassword
        }
      }

      const mail: bodyMail = {
        from: '<' + config.emailAccount + '>', // sender address
				to: request.body.to, // list of receivers
				subject: request.body.subject, // Subject line
				html: request.body.body, 
				attachments: request.body.attachments
      }

      const result = await new EmailUC(
        request.database,
        request.headers.authorization,
      ).sendEmail(smtp,mail) 

      response.send(new Responser(200, result))
    } catch (error) {
      next(
        new HttpException(new Responser(error.status || 500, null, error.message, error)),
      )
    }
  }
}
