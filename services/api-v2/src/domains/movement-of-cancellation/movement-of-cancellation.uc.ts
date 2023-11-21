import Responseable from 'interfaces/responsable.interface'

import TransactionController from './../../domains/transaction/transaction.controller'
import {TransactionState} from './../../domains/transaction/transaction.interface'
import MovementOfCancellationController from './movement-of-cancellation.controller'
import MovementOfCancellation from './movement-of-cancellation.interface'

export default class MovementOfCancellationUC {
  database: string
  MovementOfCancellationController: MovementOfCancellationController

  constructor(database: string) {
    this.database = database
    this.MovementOfCancellationController = new MovementOfCancellationController(database)
  }

  returnStateCancellation = async (transactionId: string): Promise<boolean> => {
    return new Promise<boolean>(async (resolve, reject) => {
      try {
        let result: Responseable = await new MovementOfCancellationController(
          this.database,
        ).getAll({
          project: {
            operationType: 1,
            'transactionOrigin._id': 1,
            'transactionOrigin.requestStatusOrigin': 1,
            'transactionOrigin.operationType': 1,
            'transactionDestination._id': 1,
            'transactionDestination.operationType': 1,
            'type.requestStatusOrigin': 1,
          },
          match: {
            operationType: {$ne: 'D'},
            'transactionDestination._id': {$oid: transactionId},
            'transactionDestination.operationType': {$ne: 'D'},
            'transactionOrigin.operationType': {$ne: 'D'},
          },
        })

        if (result.result.length > 0) {
          let movOfCancellations: MovementOfCancellation[] = result.result

          for (let movOfCancellation of movOfCancellations) {
            await new TransactionController(this.database).updateMany(
              {_id: movOfCancellation.transactionOrigin._id},
              {
                state:
                  movOfCancellation.type && movOfCancellation.type.requestStatusOrigin
                    ? movOfCancellation.type.requestStatusOrigin
                    : TransactionState.Closed,
              },
            )
          }
        }
        resolve(true)
      } catch (error) {
        reject(error)
      }
    })
  }

  returnBalanceCancellation = async (transactionId: string): Promise<boolean> => {
    return new Promise<boolean>(async (resolve, reject) => {
      try {
        let result: Responseable = await new MovementOfCancellationController(
          this.database,
        ).getAll({
          project: {
            balance: 1,
            operationType: 1,
            'transactionOrigin._id': 1,
            'transactionOrigin.requestStatusOrigin': 1,
            'transactionOrigin.operationType': 1,
            'transactionDestination._id': 1,
            'transactionDestination.operationType': 1,
            'type.requestStatusOrigin': 1,
          },
          match: {
            operationType: {$ne: 'D'},
            'transactionDestination._id': {$oid: transactionId},
            'transactionDestination.operationType': {$ne: 'D'},
            'transactionOrigin.operationType': {$ne: 'D'},
          },
        })

        if (result.result.length > 0) {
          let movOfCancellations: MovementOfCancellation[] = result.result

          for (let movOfCancellation of movOfCancellations) {
            await new TransactionController(this.database).update(
              movOfCancellation.transactionOrigin._id,
              {$inc: {balance: movOfCancellation.balance}},
            )
          }
        }
        resolve(true)
      } catch (error) {
        reject(error)
      }
    })
  }
}
