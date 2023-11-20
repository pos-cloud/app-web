import * as express from 'express'
import RequestWithUser from 'interfaces/requestWithUser.interface'

import HttpException from '../../exceptions/HttpException'
import authMiddleware from '../../middleware/auth.middleware'
import ensureLic from '../../middleware/license.middleware'
import validationMiddleware from '../../middleware/validation.middleware'
import Responser from '../../utils/responser'
import Controller from '../model/model.controller'

import ApplyBusinessRuleDto from './apply.dto'
import ObjDto from './business-rule.dto'
import BusinessRule from './business-rule.interface'
import ObjSchema from './business-rule.model'
import BusinessRulesUC from './business-rule.uc'

export default class BusinessRulesController extends Controller {
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
        `${this.path}/apply`,
        [authMiddleware, ensureLic, validationMiddleware(ApplyBusinessRuleDto)],
        this.applyBusinessRule,
      )
      .post(
        this.path,
        [authMiddleware, ensureLic, validationMiddleware(ObjDto)],
        this.saveObj,
      )
      .put(
        `${this.path}/:id`,
        [authMiddleware, ensureLic, validationMiddleware(ObjDto)],
        this.updateObj,
      )
      .delete(`${this.path}/:id`, [authMiddleware, ensureLic], this.deleteObj)
  }

  saveObj = async (
    request: RequestWithUser,
    response: express.Response,
    next: express.NextFunction,
  ) => {
    try {
      this.initConnectionDB(request.database)
      this.userAudit = request.user
      const objData = request.body
      const businessRule: BusinessRule = await new BusinessRulesUC(this.database).create(
        objData,
      )

      response.send(new Responser(200, businessRule))
    } catch (error) {
      next(
        new HttpException(new Responser(error.status || 500, null, error.message, error)),
      )
    }
  }

  applyBusinessRule = async (
    request: RequestWithUser,
    response: express.Response,
    next: express.NextFunction,
  ) => {
    try {
      this.initConnectionDB(request.database)
      this.userAudit = request.user
      const {code, transactionId} = request.body
      const result = await new BusinessRulesUC(this.database).applyBusinessRule(
        code,
        transactionId,
      )

      response.send(new Responser(200, result))
    } catch (error) {
      next(
        new HttpException(new Responser(error.status || 500, null, error.message, error)),
      )
    }
  }
}
