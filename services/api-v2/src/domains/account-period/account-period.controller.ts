import * as express from 'express'

import authMiddleware from '../../middleware/auth.middleware'
import ensureLic from '../../middleware/license.middleware'
import validationMiddleware from '../../middleware/validation.middleware'
import Controller from '../model/model.controller'

import ObjDto from './account-period.dto'
import ObjSchema from './account-period.model'

export default class AccountPeriodController extends Controller {
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
      .put(
        `${this.path}/:id`,
        [authMiddleware, ensureLic, validationMiddleware(ObjDto)],
        this.updateObj,
      )
      .delete(`${this.path}/:id`, [authMiddleware, ensureLic], this.deleteObj)
  }
}
