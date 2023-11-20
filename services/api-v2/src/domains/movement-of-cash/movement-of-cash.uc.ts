import * as mercadopago from 'mercadopago'

import PaymentMethodController from './../../domains/payment-method/payment-method.controller'
import PaymentMethod from './../../domains/payment-method/payment-method.interface'
import {
  CurrentAccount,
  Movements,
} from './../../domains/transaction-type/transaction-type.interface'
import TransactionController from './../../domains/transaction/transaction.controller'
import Transaction from './../../domains/transaction/transaction.interface'
import Responseable from './../../interfaces/responsable.interface'
import MovementOfCashController from './movement-of-cash.controller'
import MovementOfCash, {StatusCheck} from './movement-of-cash.interface'
import { roundNumber } from './../../utils/roundNumber'

export class MovementOfCashUC {
  database: string
  movementOfCashController: MovementOfCashController
  transactionController: TransactionController

  constructor(database: string) {
    this.database = database
    this.movementOfCashController = new MovementOfCashController(database)
    this.transactionController = new TransactionController(database)
  }

  validateMovementOfCash = async (movementOfCash: MovementOfCash): Promise<void> => {
    return new Promise<void>(async (resolve, reject) => {
      try {
        const {paymentMethod, transaction} = await this.validateValues(movementOfCash)

        await this.validatePaymentChange(movementOfCash, paymentMethod)
        await this.validateCurrentAccount(movementOfCash, paymentMethod, transaction)
        await this.validateAmountPaid(movementOfCash, paymentMethod, transaction)
        if (movementOfCash.type.mercadopagoAccessToken) {
          await this.validateMercadoPago(movementOfCash, transaction)
        }
        resolve()
      } catch (error) {
        reject(error)
      }
    })
  }

  validateValues = async (
    movementOfCash: MovementOfCash,
  ): Promise<{paymentMethod: PaymentMethod; transaction: Transaction}> => {
    return new Promise<{paymentMethod: PaymentMethod; transaction: Transaction}>(
      async (resolve, reject) => {
        try {
          if (!movementOfCash.type)
            throw new Error('Debe informar un tipo de método de pago correcto')
          let result: Responseable = await new PaymentMethodController(
            this.database,
          ).getAll({
            project: {_id: 1, acceptReturned: 1, isCurrentAccount: 1, operationType: 1},
            match: {
              _id: {$oid: movementOfCash.type._id || movementOfCash.type.toString()},
              operationType: {$ne: 'D'},
            },
          })
          let paymentMethod: PaymentMethod = result.result[0]

          if (!paymentMethod)
            throw new Error('Debe informar un tipo de método de pago correcto')

          result = await new TransactionController(this.database).getAll({
            project: {
              _id: 1,
              number: 1,
              totalPrice: 1,
              operationType: 1,
              'company.identificationValue': 1,
              'company.emails': 1,
              'company.allowCurrentAccount': 1,
              'type.currentAccount': 1,
              'type.allowZero': 1,
            },
            match: {
              _id: {
                $oid:
                  movementOfCash.transaction._id || movementOfCash.transaction.toString(),
              },
              operationType: {$ne: 'D'},
            },
          })
          let transaction: Transaction = result.result[0] || null

          if (!transaction) throw Error('Debe informar una transacción válida')
          resolve({paymentMethod, transaction})
        } catch (error) {
          reject(error)
        }
      },
    )
  }

  validateCurrentAccount = async (
    movementOfCash: MovementOfCash,
    paymentMethod: PaymentMethod,
    transaction: Transaction,
  ): Promise<void> => {
    return new Promise<void>(async (resolve, reject) => {
      try {
        if (paymentMethod.isCurrentAccount && !transaction.company)
          throw new Error('Debe informar una empresa para pagos tipo Cuenta Corriente')
        if (paymentMethod.isCurrentAccount && !transaction.company.allowCurrentAccount)
          throw new Error(
            'La empresa no esta habilitada para pagos tipo Cuenta Corriente',
          )
        if (
          paymentMethod.isCurrentAccount &&
          transaction.type.currentAccount === CurrentAccount.Charge
        )
          throw new Error(
            'No se puede elegir un tipo de método de pago Cuenta Corriente para este tipo de transacción',
          )
        resolve()
      } catch (error) {
        reject(error)
      }
    })
  }

  validatePaymentChange = async (
    movementOfCash: MovementOfCash,
    paymentMethod: PaymentMethod,
  ): Promise<void> => {
    return new Promise<void>(async (resolve, reject) => {
      try {
        if (
          movementOfCash.paymentChange === undefined ||
          movementOfCash.paymentChange === null
        )
          movementOfCash.paymentChange = 0
        if (!paymentMethod.acceptReturned && movementOfCash.paymentChange != 0)
          throw new Error('El método de pago no acepta vuelto')
        resolve()
      } catch (error) {
        reject(error)
      }
    })
  }

  validateAmountPaid = async (
    movementOfCash: MovementOfCash,
    paymentMethod: PaymentMethod,
    transaction: Transaction,
  ): Promise<void> => {
    return new Promise<void>(async (resolve, reject) => {
      try {
        let totalAmountPaid: number = 0
        let totalPriceTransaction: number = 0
        let amountDiscount: number = 0

        if (movementOfCash.amountPaid === undefined || movementOfCash.amountPaid === null)
          throw new Error('Debe informar el monto a abonar')
        totalPriceTransaction = transaction.totalPrice
        if (totalPriceTransaction > 0) {
          let result: Responseable = await this.movementOfCashController.getAll({
            project: {
              _id: 1,
              transaction: 1,
              amountPaid: 1,
              amountDiscount: 1,
              operationType: 1,
              surcharge: 1,
              discount: 1
            },
            match: {
              transaction: {$oid: transaction._id},
              operationType: {$ne: 'D'},
              _id: {$ne: {$oid: movementOfCash._id}},
            },
          })
          let movementsOfCashes: MovementOfCash[] = result.result
          if (movementsOfCashes && movementsOfCashes.length > 0) {
            for (let mov of movementsOfCashes) {
              totalAmountPaid += mov.amountPaid
              if (mov.surcharge > 0) {
                amountDiscount += mov.amountDiscount
              } else {
                amountDiscount -= mov.amountDiscount
              }
            }
          }
          totalAmountPaid += roundNumber(movementOfCash.amountPaid);
          if (movementOfCash.surcharge > 0) {
            amountDiscount += movementOfCash.amountDiscount
          } else {
            amountDiscount -= movementOfCash.amountDiscount
          }
          // TODO: mejorar cuando se mejore el front. Por que el front actualiza el precio de la transaccion cuando guarda el primer metodo de pago.
          if (
            !transaction.type.allowZero &&
            totalAmountPaid - amountDiscount > totalPriceTransaction 
          )
            throw new Error('El monto a pagar no puede ser mayor al de la transacción')
        }
        resolve()
      } catch (error) {
        reject(error)
      }
    })
  }

  validateMercadoPago = async (
    movementOfCash: MovementOfCash,
    transaction: Transaction,
  ): Promise<void> => {
    return new Promise<void>(async (resolve, reject) => {
      try {
        if (!movementOfCash.tokenMP || !movementOfCash.paymentMP)
          throw new Error('Tarjeta no válida')
        mercadopago.configurations.setAccessToken(
          movementOfCash.type.mercadopagoAccessToken,
        )
        let payment_data = {
          transaction_amount: movementOfCash.amountPaid,
          token: movementOfCash.tokenMP,
          description: 'Pedido Web-' + transaction.number,
          installments: movementOfCash.quota,
          payment_method_id: movementOfCash.paymentMP,
          payer: {
            email: transaction.company.emails,
            identification: {
              type: 'dni',
              number: transaction.company.identificationValue,
            },
          },
        }
        let result: any = mercadopago.payment.save(payment_data)

        if (result.body.status !== 'approved') throw new Error('Pago rechazado')
        resolve()
      } catch (error) {
        reject(error)
      }
    })
  }

  deleteByTransaction = async (transactionId: string): Promise<void> => {
    return new Promise<void>(async (resolve, reject) => {
      try {
        let result: Responseable
        let movementsOfCashes: MovementOfCash[]

        result = await this.movementOfCashController.getAll({
          project: {_id: 1, transaction: 1},
          match: {transaction: {$oid: transactionId}},
        })
        movementsOfCashes = result.result
        movementsOfCashes.forEach(async (movementOfCash: MovementOfCash) => {
          await this.deleteMovementOfCash(movementOfCash._id)
        })
        resolve()
      } catch (error) {
        reject(error)
      }
    })
  }

  deleteMovementOfCash = async (movementOfCashId: string): Promise<void> => {
    return new Promise<void>(async (resolve, reject) => {
      try {
        let result: Responseable
        let movementOfCash: MovementOfCash

        result = await this.movementOfCashController.getAll({
          project: {
            _id: 1,
            number: 1,
            'type._id': 1,
            'type.inputAndOuput': 1,
            'transaction.type.movement': 1,
          },
          match: {_id: {$oid: movementOfCashId}},
        })
        if (result.result.length === 0)
          throw new Error('No se encuentra el movimiento de pago')
        movementOfCash = result.result[0]
        await this.movementOfCashController.delete(movementOfCash._id)
        if (
          movementOfCash.type.inputAndOuput &&
          movementOfCash.number &&
          movementOfCash.number !== '' &&
          movementOfCash.number !== '0' &&
          movementOfCash.transaction.type.movement !== Movements.Inflows
        )
          await this.movementOfCashController.updateMany(
            {number: movementOfCash.number, type: movementOfCash.type._id},
            {statusCheck: StatusCheck.Available},
          )

        resolve()
      } catch (error) {
        reject(error)
      }
    })
  }
}
