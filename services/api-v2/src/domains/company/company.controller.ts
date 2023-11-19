import * as express from 'express'

import Controller from '../model/model.controller'

import TransactionController from './../../domains/transaction/transaction.controller'
import UserController from './../../domains/user/user.controller'
import HttpException from './../../exceptions/HttpException'
import RequestWithUser from './../../interfaces/requestWithUser.interface'
import Responseable from './../../interfaces/responsable.interface'
import authMiddleware from './../../middleware/auth.middleware'
import ensureLic from './../../middleware/license.middleware'
import validationMiddleware from './../../middleware/validation.middleware'
import Responser from './../../utils/responser'
import ObjDto from './company.dto'
import ObjSchema from './company.model'

export default class CompanyController extends Controller {
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
      .put(`${this.path}/:id`, [authMiddleware, ensureLic], this.updateObj)
      .delete(`${this.path}/:id`, [authMiddleware, ensureLic], this.deleteCompany)
  }

  public deleteCompany = async (
    request: RequestWithUser,
    response: express.Response,
    next: express.NextFunction,
  ) => {
    this.initConnectionDB(request.database)
    this.userAudit = request.user
    const id = request.params.id

    new TransactionController(request.database)
      .getAll({match: {operationType: {$ne: 'D'}, company: {$oid: id}}})
      .then((result: Responseable) => {
        if (result.status === 200) {
          result.result.length > 0
            ? next(
                new HttpException(
                  new Responser(
                    400,
                    null,
                    'No se puede eliminar la empresa, tiene transacciones asociadas',
                    'No se puede eliminar la empresa, tiene transacciones asociadas',
                  ),
                ),
              )
            : new UserController(request.database)
                .getAll({match: {operationType: {$ne: 'D'}, company: {$oid: id}}})
                .then((result: Responseable) => {
                  if (result.status === 200) {
                    result.result.length > 0
                      ? next(
                          new HttpException(
                            new Responser(
                              400,
                              null,
                              'No se puede eliminar la empresa, tiene usuarios asociados',
                              'No se puede eliminar la empresa, tiene usuarios asociados',
                            ),
                          ),
                        )
                      : this.deleteObj(request, response, next)
                  } else next(new HttpException(result))
                })
                .catch((error: Responseable) =>
                  next(new HttpException(new Responser(500, null, error.message, error))),
                )
        } else next(new HttpException(result))
      })
      .catch((error: Responseable) =>
        next(new HttpException(new Responser(500, null, error.message, error))),
      )
  }
}
