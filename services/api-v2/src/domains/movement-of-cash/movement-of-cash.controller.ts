import * as express from 'express'

import RequestWithUser from '../../interfaces/requestWithUser.interface'
import authMiddleware from '../../middleware/auth.middleware'
import ensureLic from '../../middleware/license.middleware'
import validationMiddleware from '../../middleware/validation.middleware'
import Controller from '../model/model.controller'

import HttpException from './../../exceptions/HttpException'
import Responseable from './../../interfaces/responsable.interface'
import Responser from './../../utils/responser'
import ObjDto from './movement-of-cash.dto'
import MovementOfCash from './movement-of-cash.interface'
import ObjSchema from './movement-of-cash.model'
import {MovementOfCashUC} from './movement-of-cash.uc'

export default class MovementOfCashController extends Controller {
  EJSON: any = require('bson').EJSON
  path = ObjSchema.getPath()
  router = express.Router()
  obj: any

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

  saveObj = async (
    request: RequestWithUser,
    response: express.Response,
    next: express.NextFunction,
  ) => {
    try {
      this.initConnectionDB(request.database)
      this.userAudit = request.user
      let objData: MovementOfCash = request.body

      objData = await this.saveMovementOfCash(objData)
      response.send(new Responser(200, objData))
    } catch (error) {
      next(
        new HttpException(new Responser(error.status || 500, null, error.message, error)),
      )
    }
  }

  saveMovementOfCash = async (
    movementOfCash: MovementOfCash,
  ): Promise<MovementOfCash> => {
    return new Promise<MovementOfCash>(async (resolve, reject) => {
      try {
        await new MovementOfCashUC(this.database).validateMovementOfCash(movementOfCash)
        movementOfCash = Object.assign(
          ObjSchema.getInstance(this.database),
          movementOfCash,
        )
        const result: Responseable = await this.save(movementOfCash)

        resolve(result.result)
      } catch (error) {
        reject(error)
      }
    })
  }

  updateObj = async (
    request: RequestWithUser,
    response: express.Response,
    next: express.NextFunction,
  ) => {
    try {
      this.initConnectionDB(request.database)
      this.userAudit = request.user
      const id = request.params.id
      let objData: any = request.body

      objData._id = id
      objData = await this.updateMovementOfCash(objData)
      response.send(new Responser(200, objData))
    } catch (error) {
      next(
        new HttpException(new Responser(error.status || 500, null, error.message, error)),
      )
    }
  }

  updateMovementOfCash = async (
    movementOfCash: MovementOfCash,
  ): Promise<MovementOfCash> => {
    return new Promise<MovementOfCash>(async (resolve, reject) => {
      try {
        await new MovementOfCashUC(this.database).validateMovementOfCash(movementOfCash)
        const result: Responseable = await this.update(movementOfCash._id, movementOfCash)

        resolve(result.result)
      } catch (error) {
        reject(error)
      }
    })
  }
}
