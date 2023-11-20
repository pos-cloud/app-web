import * as express from 'express'

import HttpException from '../../exceptions/HttpException'
import RequestWithUser from '../../interfaces/requestWithUser.interface'
import Responseable from '../../interfaces/responsable.interface'
import authMiddleware from '../../middleware/auth.middleware'
import ensureLic from '../../middleware/license.middleware'
import Responser from '../../utils/responser'

import TransactionTypeController from './../../domains/transaction-type/transaction-type.controller'
import {TransactionType} from './../../domains/transaction-type/transaction-type.interface'
import TransactionController from './../../domains/transaction/transaction.controller'
import Transaction from './../../domains/transaction/transaction.interface'
import NotFoundException from './../../exceptions/NotFoundException'

export default class OrderNumberController {
  public path = '/set-order-number'
  public router = express.Router()
  public database: string

  constructor() {
    this.initializeRoutes()
  }

  private initializeRoutes() {
    this.router.post(
      `${this.path}`,
      [authMiddleware, ensureLic],
      this.setOrderNumberTransaction,
    )
  }

  private setOrderNumberTransaction = (
    request: RequestWithUser,
    response: express.Response,
    next: express.NextFunction,
    transactionId: string = null,
  ) => {
    this.database = request.database
    transactionId = request.body.transaction._id

    // TRAEMOS DE LA BASE EL MOVIMIENTO DEL ARTÍCULO
    new TransactionController(this.database)
      .getAll({
        project: {
          _id: 1,
          operationType: 1,
          'type._id': 1,
          'type.orderNumber': 1,
          'type.operationType': 1,
        },
        match: {
          _id: {$oid: transactionId},
          'type.operationType': {$ne: 'D'},
        },
      })
      .then(async (result: Responseable) => {
        if (result.status === 200) {
          if (result.result.length > 0) {
            let transaction: Transaction = result.result[0]
            let transactionType: TransactionType = result.result[0].type

            transaction.orderNumber = transaction.type.orderNumber
            transactionType.orderNumber = transaction.orderNumber + 1
            await new TransactionController(this.database)
              .update(transaction._id, transaction)
              .then(async (result: Responseable) => {
                if (result.status === 200) {
                  await new TransactionTypeController(this.database)
                    .update(transactionType._id, transactionType)
                    .then(async (result: Responseable) => {
                      if (result.status === 200) {
                        response.send(new Responser(200, 'Se enumero bien'))
                      } else {
                        next(
                          new HttpException(
                            new Responser(result.status, null, result.message, result),
                          ),
                        )
                      }
                    })
                    .catch((error: Responseable) => {
                      next(
                        new HttpException(new Responser(500, null, error.message, error)),
                      )
                    })
                } else {
                  next(
                    new HttpException(
                      new Responser(result.status, null, result.message, result),
                    ),
                  )
                }
              })
              .catch((error: Responseable) => {
                next(new HttpException(new Responser(500, null, error.message, error)))
              })
          } else {
            next(new NotFoundException(transactionId))
          }
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
