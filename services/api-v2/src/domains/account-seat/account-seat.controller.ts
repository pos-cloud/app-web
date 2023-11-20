import * as express from 'express'

import HttpException from '../../exceptions/HttpException'
import authMiddleware from '../../middleware/auth.middleware'
import ensureLic from '../../middleware/license.middleware'
import validationMiddleware from '../../middleware/validation.middleware'
import Responser from '../../utils/responser'
import Controller from '../model/model.controller'

import RequestWithUser from './../../interfaces/requestWithUser.interface'
import Responseable from './../../interfaces/responsable.interface'
import ObjDto from './account-seat.dto'
import AccountSeat from './account-seat.interface'
import ObjSchema from './account-seat.model'

export default class AccountSeatController extends Controller {
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
      .post(`${this.path}/fullquery`, [authMiddleware, ensureLic], this.getFullQueryObjs)
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
      .delete(
        `${this.path}/transaction/:id`,
        [authMiddleware, ensureLic],
        this.deleteObjByTransaction,
      )
  }

  public deleteObjByTransaction = async (
    request: RequestWithUser,
    response: express.Response,
    next: express.NextFunction,
  ) => {
    this.initConnectionDB(request.database)
    this.userAudit = request.user
    const id = request.params.id

    await this.getAccountSeat(request.database, id).then((result: AccountSeat) => {
      if (result && result._id) {
        this.delete(result._id)
          .then((result: Responseable) => response.send(new Responser(200, result)))
          .catch((error: Responseable) =>
            next(new HttpException(new Responser(500, null, error.message, error))),
          )
      } else response.send(new Responser(200, result))
    })
  }

  public getAccountSeat = async (
    database: string,
    transactionID: string,
  ): Promise<AccountSeat> => {
    return new Promise<AccountSeat>(async (resolve, reject) => {
      await new AccountSeatController(database)
        .getAll({match: {transaction: {$oid: transactionID}}})
        .then(async (result: Responseable) => {
          if (result.result.length > 0) resolve(result.result[0])
          else resolve(null)
        })
        .catch((error: Responseable) => reject(error))
    })
  }
}
