import * as bcrypt from 'bcryptjs'
import * as express from 'express'

import PropertyValueExistsException from '../../exceptions/PropertyValueExistsException'
import Controller from '../model/model.controller'

import HttpException from './../../exceptions/HttpException'
import RequestWithUser from './../../interfaces/requestWithUser.interface'
import Responseable from './../../interfaces/responsable.interface'
import authMiddleware from './../../middleware/auth.middleware'
import ensureLic from './../../middleware/license.middleware'
import validationMiddleware from './../../middleware/validation.middleware'
import Responser from './../../utils/responser'
import ObjDto from './user.dto'
import ObjSchema from './user.model'

export default class UserController extends Controller {
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
        this.saveUser,
      )
      .put(`${this.path}/:id`, [authMiddleware, ensureLic], this.updateUser)
      .delete(`${this.path}/:id`, [authMiddleware, ensureLic], this.deleteObj)
  }

  public saveUser = async (
    request: RequestWithUser,
    response: express.Response,
    next: express.NextFunction,
  ) => {
    this.initConnectionDB(request.database)
    this.userAudit = request.user
    const objData = request.body

    objData.password = await bcrypt.hash(objData.password, 10)
    await this.getAll({match: {email: objData.email}})
      .then(async (result: Responseable) => {
        if (result.status === 200 && result.result.length > 0) {
          next(new PropertyValueExistsException('email', objData.email))
        } else {
          this.saveObj(request, response, next)
        }
      })
      .catch((error: Responseable) =>
        next(new HttpException(new Responser(500, null, error.message, error))),
      )
  }

  public updateUser = async (
    request: RequestWithUser,
    response: express.Response,
    next: express.NextFunction,
  ) => {
    this.initConnectionDB(request.database)
    this.userAudit = request.user
    const id = request.params.id
    const objData: ObjDto = request.body

    await this.getById(id)
      .then(async (result: Responseable) => {
        let obj: any = result.result

        if (objData.password && obj.password !== objData.password)
          objData.password = await bcrypt.hash(objData.password, 10)
        this.updateObj(request, response, next)
      })
      .catch((error: Responseable) =>
        next(new HttpException(new Responser(500, null, error.message, error))),
      )
  }
}
