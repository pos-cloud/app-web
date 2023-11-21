import * as express from 'express'

import HttpException from '../../exceptions/HttpException'
import authMiddleware from '../../middleware/auth.middleware'
import ensureLic from '../../middleware/license.middleware'
import Responser from '../../utils/responser'

import MovementOfCashController from './../../domains/movement-of-cash/movement-of-cash.controller'
import MovementOfCash from './../../domains/movement-of-cash/movement-of-cash.interface'
import {
  CurrentAccount,
  Movements,
} from './../../domains/transaction-type/transaction-type.interface'
import RequestWithUser from './../../interfaces/requestWithUser.interface'
import Responseable from './../../interfaces/responsable.interface'

export default class getSummaryCurrentAccount {
  public EJSON: any = require('bson').EJSON
  public path = '/get-summary-current-account'
  public router = express.Router()
  public database: string

  constructor() {
    this.initializeRoutes()
  }

  private initializeRoutes() {
    this.router.post(
      `${this.path}/:companyId`,
      [authMiddleware, ensureLic],
      this.getTotalCurrenAccount,
    )
  }

  private getTotalCurrenAccount = (
    request: RequestWithUser,
    response: express.Response,
    next: express.NextFunction,
  ) => {
    this.database = request.database
    let companyId: string

    companyId = request.params.companyId

    new MovementOfCashController(this.database)
      .getAll({
        project: {
          _id: 1,
          operationType: 1,
          'transaction._id': 1,
          'transaction.type.currentAccount': 1,
          'transaction.type.movement': 1,
          'transaction.operationType': 1,
          'transaction.company._id': 1,
          amountPaid: 1,
          'type.isCurrentAccount': 1,
        },
        match: {
          operationType: {$ne: 'D'},
          'transaction.operationType': {$ne: 'D'},
          'transaction.company._id': {$oid: companyId},
        },
      })
      .then(async (result: Responseable) => {
        if (result.status === 200) {
          let total = 0

          if (result.result.length > 0) {
            let movCash: MovementOfCash[] = result.result

            movCash.forEach((element) => {
              if (element.transaction.type.currentAccount === CurrentAccount.Charge)
                total -= element.amountPaid
              if (
                element.transaction.type.currentAccount === CurrentAccount.Yes &&
                element.transaction.type.movement === Movements.Inflows
              )
                total += element.amountPaid
              if (
                element.transaction.type.currentAccount === CurrentAccount.Yes &&
                element.transaction.type.movement === Movements.Outflows
              )
                total -= element.amountPaid
            })
          }
          response.send(new Responser(200, total))
        } else {
          next(
            new HttpException(new Responser(result.status, null, result.message, result)),
          )
        }
      })
      .catch((error: Responseable) => {
        next(new HttpException(new Responser(500, null, error.message, error)))
      })
  }
}
