import * as axios from 'axios'
import * as moment from 'moment'

import AccountSeatController from './../../domains/account-seat/account-seat.controller'
import ArticleUC from './../../domains/article/article.uc'
import BusinessRulesUC from './../../domains/business-rule/business-rule.uc'
import CancellationTypeController from './../../domains/cancellation-type/cancellation-type.controller'
import CancellationType from './../../domains/cancellation-type/cancellation-type.interface'
import CashBoxController from './../../domains/cash-box/cash-box.controller'
import {CashBoxState} from './../../domains/cash-box/cash-box.interface'
import CompanyController from './../../domains/company/company.controller'
import ConfigController from './../../domains/config/config.controller'
import Config from './../../domains/config/config.interface'
import MovementOfArticleController from './../../domains/movement-of-article/movement-of-article.controller'
import MovementOfArticle from './../../domains/movement-of-article/movement-of-article.interface'
import MovementOfArticleUC from './../../domains/movement-of-article/movement-of-article.uc'
import MovementOfCancellationController from './../../domains/movement-of-cancellation/movement-of-cancellation.controller'
import MovementOfCancellation from './../../domains/movement-of-cancellation/movement-of-cancellation.interface'
import MovementOfCancellationUC from './../../domains/movement-of-cancellation/movement-of-cancellation.uc'
import MovementOfCashController from './../../domains/movement-of-cash/movement-of-cash.controller'
import MovementOfCash from './../../domains/movement-of-cash/movement-of-cash.interface'
import {MovementOfCashUC} from './../../domains/movement-of-cash/movement-of-cash.uc'
import TaxController from './../../domains/tax/tax.controller'
import {TaxClassification} from './../../domains/tax/tax.interface'
import Taxes from './../../domains/tax/taxes.interface'
import TransactionTypeController from './../../domains/transaction-type/transaction-type.controller'
import {
  CurrentAccount,
  Movements,
  TransactionMovement,
  TransactionType,
} from './../../domains/transaction-type/transaction-type.interface'
import WooCommerceController from './../../domains/uc/woocomerce.controller'
import User from './../../domains/user/user.interface'
import NotFoundException from './../../exceptions/NotFoundException'
import Responseable from './../../interfaces/responsable.interface'
import config from './../../utils/config'
import {roundNumber} from './../../utils/roundNumber'
import TransactionController from './transaction.controller'
import Transaction, {TransactionState} from './transaction.interface'
import TransactionSchema from './transaction.model'

export default class TransactionUC {
  database: string
  transactionController: TransactionController
  api: any
  authToken: string
  userAudit: User

  constructor(database: string, authToken?: string, userAudit?:User) {
    this.database = database
    this.authToken = authToken
    this.transactionController = new TransactionController(database,userAudit)
    this.api = axios.default
    this.userAudit = userAudit;
  }

  createTransaction = async (
    transaction: Transaction,
    movementsOfCashes: MovementOfCash[],
    movementsOfArticles: MovementOfArticle[],
    user: User,
  ): Promise<{
    transaction: Transaction
    movementsOfCashes: MovementOfCash[]
    movementsOfArticles: MovementOfArticle[]
  }> => {
    return new Promise<{
      transaction: Transaction
      movementsOfCashes: MovementOfCash[]
      movementsOfArticles: MovementOfArticle[]
    }>(async (resolve, reject) => {
      try {
        let transactionController: TransactionController = new TransactionController(
          this.database,
        )

        transactionController.initConnectionDB(this.database)
        transactionController.userAudit = user

        let movementOfArticleController: MovementOfArticleController =
          new MovementOfArticleController(this.database)

        movementOfArticleController.initConnectionDB(this.database)
        movementOfArticleController.userAudit = user

        let movementOfCashController: MovementOfCashController =
          new MovementOfCashController(this.database)

        movementOfCashController.initConnectionDB(this.database)
        movementOfCashController.userAudit = user

        if (!transaction.type) {
          throw new Error(`Debe informar un tipo de transacción válido`)
        }

        let transactionTypeId: string =
          transaction.type._id || transaction.type.toString()

        let result: Responseable

        result = await new TransactionTypeController(this.database).getAll({
          project: {
            _id: 1,
            requestArticles: 1,
            requestPaymentMethods: 1,
            maxOrderNumber: 1,
          },
          match: {_id: {$oid: transactionTypeId}},
          limit: 1,
        })

        if (result.result.length === 0) {
          throw new Error(`Debe informar un tipo de transacción válido`)
        }
        const transactionType: TransactionType = result.result[0]

        if (
          transactionType.requestArticles &&
          (!movementsOfArticles || movementsOfArticles.length === 0)
        ) {
          throw new Error(`Debe informar movimientos de artículos`)
        }

        if (
          transactionType.requestPaymentMethods &&
          (!movementsOfCashes || movementsOfCashes.length === 0)
        ) {
          throw new Error(`Debe informar movimientos de medios`)
        }

        transaction.type = transactionType
        transaction = await this.saveTransaction(transaction)

        // VALIDACIONES
        const movementsOfCashesToReturn: MovementOfCash[] = new Array()

        if (movementsOfCashes.length > 0) {
          for (let movementOfCash of movementsOfCashes) {
            movementOfCash.transaction = transaction
            movementsOfCashesToReturn.push(
              await movementOfCashController.saveMovementOfCash(movementOfCash),
            )
          }
        }

        const movementsOfArticlesToReturn: MovementOfArticle[] = new Array()

        if (movementsOfArticles.length > 0) {
          for (let movementOfArticle of movementsOfArticles) {
            movementOfArticle.transaction = transaction
            movementsOfArticlesToReturn.push(
              await movementOfArticleController.saveMovementOfArticle(movementOfArticle),
            )
          }
        }

        resolve({
          transaction,
          movementsOfCashes: movementsOfCashesToReturn,
          movementsOfArticles: movementsOfArticlesToReturn,
        })
      } catch (error) {
        reject(error)
      }
    })
  }

  saveTransaction = async (transaction: Transaction): Promise<Transaction> => {
    return new Promise<Transaction>(async (resolve, reject) => {
      try {
        if (!transaction) {
          throw new Error(`Debe informar un transacción válida`)
        }
        if (!transaction.type) {
          throw new Error(`Debe informar un tipo de transacción válido`)
        }
        if (!transaction._id || transaction._id === '') {
          transaction = Object.assign(
            TransactionSchema.getInstance(this.database),
            transaction,
          )
        }
        if (transaction.number === 0 || !transaction.number) {
          transaction.number = await this.getTransactionNumber(transaction)
        }
        
        let result: Responseable = await this.transactionController.save(transaction)
        
        transaction = result.result
        let response = await this.api.get(
          `${config.API_URL}/transaction?id=${transaction._id}`,
          {
            headers: {Authorization: this.authToken},
          },
        )

        resolve(response.data.transaction)
      } catch (error) {
        console.log(error)
        reject(error)
      }
    })
  }

  updateTransaction = async (
    id: string,
    transaction: Transaction,
  ): Promise<Transaction> => {
    let transactionResponse

    try {
      transaction._id = id

      await this.validateTransaction(transaction)
      if (transaction.number === 0 || !transaction.number) {
        transaction.number = await this.getTransactionNumber(transaction)
      }

      if (
        (!transaction.orderNumber || transaction.orderNumber === 0) &&
        transaction.type.orderNumber &&
        transaction.type.orderNumber != 0
      ) {
        transaction.orderNumber = transaction.type.orderNumber
        await this.updateTransactionTypeOrder(transaction.type)
      }

      await this.transactionController.update(id, transaction)
      const response = await this.api.get(`${config.API_URL}/transaction?id=${id}`, {
        headers: {Authorization: this.authToken},
      })

      transactionResponse = response.data.transaction
    } catch (error) {
      return error
    }

    if (
      transaction.state === TransactionState.Closed &&
      transaction.type.updatePrice === 'Ultima Compra'
    ) {
      new ArticleUC(this.database, this.authToken).updatePurchasePrice(transaction._id)
    }

    return transactionResponse
  }

  deleteTransaction = async (transactionId: string): Promise<Transaction> => {
    let transaction: Transaction
    let result: Responseable

    result = await this.transactionController.getAll({
      project: {
        _id: 1,
        CAE: 1,
        operationType: 1,
        state: 1,
        'type.cashClosing': 1,
        'cashBox._id': 1,
      },
      match: {_id: {$oid: transactionId}},
    })
    if (result.result.length === 0) {
      throw new Error(`No se encuentra el registro ${transactionId} a eliminar`)
    }
    transaction = result.result[0]

    if (transaction.CAE) {
      throw new Error(`No se puede eliminar una transacción con CAE`)
    }
    if (transaction.operationType === 'D') {
      throw new Error('La transacción ya se encuentra eliminada')
    }
    await new MovementOfArticleUC(this.database).deleteByTransaction(transactionId)
    await new MovementOfCashUC(this.database).deleteByTransaction(transactionId)
    await new MovementOfCashController(this.database).updateMany(
      {cancelingTransaction: transactionId},
      {balanceCanceled: 0},
    )
    await new AccountSeatController(this.database).deleteMany({
      transaction: transactionId,
    })
    if (
      transaction.state !== TransactionState.Pending &&
      transaction.state !== TransactionState.Open &&
      transaction.state !== TransactionState.Canceled &&
      transaction.state !== TransactionState.Outstanding &&
      transaction.state !== TransactionState.Preparing
    ) {
      await new MovementOfCancellationUC(this.database).returnStateCancellation(
        transactionId,
      )
      await new MovementOfCancellationUC(this.database).returnBalanceCancellation(
        transactionId,
      )
    }
    await new BusinessRulesUC(this.database).returnStockByTransaction(transactionId)

    await this.transactionController.delete(transactionId)
    if (transaction.type.cashClosing) {
      await new CashBoxController(this.database).update(transaction.cashBox._id, {
        status: CashBoxState.Open,
        closingDate: null,
      })
    }

    return transaction
  }

  private finishTransaction = async (transaction: Transaction) => {
    let transactionTypeId: string =
      transaction.type && transaction.type._id
        ? transaction.type._id
        : transaction.type.toString()
    let result: Responseable = await new TransactionTypeController(this.database).getAll({
      project: {_id: 1, requestArticles: 1, requestPaymentMethods: 1},
      match: {_id: {$oid: transactionTypeId}},
      limit: 1,
    })

    if (result.result.length === 0) {
      throw new Error(`Debe informar un tipo de transacción válido`)
    }
  }

  recalculateTaxes = async (transaction: Transaction): Promise<Taxes[]> => {
    let result: Responseable = await this.transactionController.getAll({
      project: {
        exempt: 1,
        basePrice: 1,
        'type._id': 1,
        'type.requestTaxes': 1,
        'taxes.tax._id': 1,
        'taxes.tax.classification': 1,
        'taxes.percentage': 1,
        'taxes.taxBase': 1,
        'taxes.taxAmount': 1,
      },
      match: {
        _id: {
          $oid: transaction._id || transaction.toString(),
        },
      },
    })

    if (result.result.length === 0) {
      throw new NotFoundException(`No se encuentra el registro ${transaction._id}`)
    }

    transaction = result.result[0]

    if (transaction.type.requestTaxes) {
      let movementsOfArticles: MovementOfArticle[] = new Array()

      await new MovementOfArticleController(this.database)
        .getAll({
          project: {transaction: 1, taxes: 1, salePrice: 1},
          match: {
            transaction: {
              $oid: transaction._id || transaction.toString(),
            },
          },
        })
        .then((result: Responseable) => {
          movementsOfArticles = result.result
        })
      let oldTaxes: Taxes[] = transaction.taxes
      let transactionTaxes: Taxes[] = new Array()
      let transactionTaxesAUX: Taxes[] = new Array()

      transaction.exempt = 0
      transaction.basePrice = 0
      for (let movementOfArticle of movementsOfArticles) {
        if (movementOfArticle.taxes && movementOfArticle.taxes.length > 0) {
          let taxBaseTotal = 0
          let taxAmountTotal = 0

          for (let taxesAux of movementOfArticle.taxes) {
            let transactionTax: Taxes = {
              percentage: roundNumber(taxesAux.percentage),
              tax: taxesAux.tax,
              taxBase: roundNumber(taxesAux.taxBase, 4),
              taxAmount: roundNumber(taxesAux.taxAmount, 4),
            }

            transactionTaxesAUX.push(transactionTax)
            transaction.basePrice += roundNumber(transactionTax.taxBase)
            taxBaseTotal += roundNumber(transactionTax.taxBase)
            taxAmountTotal += roundNumber(transactionTax.taxAmount)
          }
          if (taxBaseTotal === 0) {
            transaction.exempt += roundNumber(
              movementOfArticle.salePrice - taxAmountTotal,
            )
          }
        } else {
          transaction.exempt += roundNumber(movementOfArticle.salePrice)
        }
      }
      transaction.basePrice = roundNumber(transaction.basePrice)
      if (transactionTaxesAUX) {
        for (let transactionTaxAux of transactionTaxesAUX) {
          let exists: boolean = false

          for (let transactionTax of transactionTaxes) {
            if (
              transactionTaxAux.tax &&
              transactionTaxAux.tax._id &&
              transactionTaxAux.tax._id.toString() === transactionTax.tax._id.toString()
            ) {
              transactionTax.taxAmount += roundNumber(transactionTaxAux.taxAmount, 4)
              transactionTax.taxBase += roundNumber(transactionTaxAux.taxBase, 4)
              exists = true
            }
          }
          if (!exists) {
            transactionTaxes.push(transactionTaxAux)
          }
        }
      }

      for (let taxes of transactionTaxes) {
        taxes.taxBase = roundNumber(taxes.taxBase)
        taxes.taxAmount = roundNumber(taxes.taxAmount)
      }
      transaction.taxes = transactionTaxes
      if (oldTaxes && oldTaxes.length > 0) {
        for (let oldTax of oldTaxes) {
          if (oldTax.tax.classification !== TaxClassification.Tax) {
            transaction.taxes.push(oldTax)
          }
        }
      }
      await this.transactionController.update(transaction._id, {taxes: transaction.taxes})
    }

    return transaction.taxes
  }

  updateBalance = async (transactionDestinationId: string): Promise<number> => {
    this.transactionController.initConnectionDB(this.database)

    let balanceOrigins = 0

    let result: Responseable

    result = await this.transactionController.getAll({
      project: {
        _id: 1,
        operationType: 1,
        balance: 1,
        totalPrice: 1,
        'type.currentAccount': 1,
      },
      match: {
        _id: {$oid: transactionDestinationId},
        operationType: {$ne: 'D'},
      },
    })
    if (result.result.length === 0) {
      throw new Error('No se encontro la transacción para actualizar el saldo')
    }
    const transactionDestination: Transaction = result.result[0]

    result = await new MovementOfCancellationController(this.database).getAll({
      project: {
        _id: 1,
        'transactionOrigin._id': 1,
        'transactionOrigin.balance': 1,
        'transactionOrigin.type._id': 1,
        'transactionOrigin.type.movement': 1,
        'transactionOrigin.type.transactionMovement': 1,
        'transactionOrigin.wooId': 1,
        transactionDestination: 1,
        balance: 1,
        operationType: 1,
      },
      match: {
        'transactionOrigin._id': {$exists: true},
        transactionDestination: {$oid: transactionDestinationId},
        operationType: {$ne: 'D'},
      },
    })
    const movementsOfCancellations: MovementOfCancellation[] = result.result

    if (movementsOfCancellations && movementsOfCancellations.length > 0) {
      for (let mov of movementsOfCancellations) {
        let balance = mov.transactionOrigin.balance

        mov.balance = roundNumber(mov.balance, 2)
        if (mov.balance > 0) balance -= mov.balance
        else balance += mov.balance
        if (balance < 0) balance = 0
        await this.transactionController.update(mov.transactionOrigin._id, {balance})
        if (mov.transactionOrigin.wooId && balance === 0) {
          await new WooCommerceController(this.database)._wUpdateOrder(
            mov.transactionOrigin.wooId,
          )
        }
        if (
          (mov.transactionOrigin.type.transactionMovement === TransactionMovement.Sale &&
            mov.transactionOrigin.type.movement === Movements.Outflows) ||
          (mov.transactionOrigin.type.transactionMovement ===
            TransactionMovement.Purchase &&
            mov.transactionOrigin.type.movement === Movements.Inflows)
        ) {
          balanceOrigins -= mov.balance
        } else {
          balanceOrigins += mov.balance
        }
      }
    }

    result = await new MovementOfCashController(this.database).getAll({
      project: {
        transaction: 1,
        operationType: 1,
        amountPaid: 1,
        'type._id': 1,
        'type.isCurrentAccount': 1,
      },
      match: {
        transaction: {$oid: transactionDestinationId},
        operationType: {$ne: 'D'},
      },
    })
    let movementsOfCashes: MovementOfCash[] = result.result

    if (movementsOfCashes && movementsOfCashes.length > 0) {
      let balance = 0

      for (let movementOfCash of movementsOfCashes) {
        if (movementOfCash.type.isCurrentAccount) {
          balance = balance + movementOfCash.amountPaid
        }
      }
      if (balance > 0) {
        transactionDestination.balance = roundNumber(balance, 2)
      } else {
        if (transactionDestination.type.currentAccount === CurrentAccount.Charge) {
          transactionDestination.balance = roundNumber(
            transactionDestination.totalPrice - balanceOrigins + balance,
            2,
          )
        } else {
          transactionDestination.balance = roundNumber(balance - balanceOrigins, 2)
        }
      }
    } else {
      transactionDestination.balance = roundNumber(transactionDestination.totalPrice, 2)
    }
    if (transactionDestination.balance < 0) transactionDestination.balance = 0
    await this.transactionController.update(transactionDestinationId, {
      balance: transactionDestination.balance,
    })

    return transactionDestination.balance
  }

  getTransactionNumber = async (transaction: Transaction): Promise<number> => {
    return new Promise<number>(async (resolve, reject) => {
      try {
        if (transaction.origin != 0 && !transaction.origin)
          throw new Error('origin is required')
        if (transaction.letter != '' && !transaction.letter)
          throw new Error('letter is required')
        if (!transaction.type._id) throw new Error('Field type._id is required')
        let number: number = 1
        const result: Responseable = await this.transactionController.getAll({
          project: {
            type: 1,
            origin: 1,
            letter: 1,
            number: 1,
            operationType: 1,
          },
          match: {
            origin: transaction.origin,
            letter: transaction.letter,
            type: {$oid: transaction.type._id},
            operationType: {$ne: 'D'},
          },
          sort: {
            number: -1,
          },
          limit: 1,
        })
        const transactions: Transaction[] = result.result

        if (transactions.length > 0) {
          number = transactions[0].number + 1
        }
        resolve(number)
      } catch (error) {
        reject(error)
      }
    })
  }

  getTransactionOrderNumber = async (transaction: Transaction): Promise<number> => {
    return new Promise<number>(async (resolve, reject) => {
      try {
        if (!transaction.type._id) throw new Error('Field type._id is required')
        if (transaction.type.maxOrderNumber != 0 && !transaction.type.maxOrderNumber)
          throw new Error('type.maxOrderNumber is required')

        let orderNumber: number = 1
        const result: Responseable = await this.transactionController.getAll({
          project: {
            type: 1,
            orderNumber: 1,
            operationType: 1,
          },
          match: {
            type: {$oid: transaction.type._id},
            operationType: {$ne: 'D'},
          },
          sort: {
            orderNumber: -1,
          },
          limit: 1,
        })
        const transactions: Transaction[] = result.result

        if (
          transactions.length > 0 &&
          transactions[0].orderNumber + 1 < transaction.type.maxOrderNumber
        ) {
          orderNumber = transactions[0].orderNumber + 1
        }
        resolve(orderNumber)
      } catch (error) {
        reject(error)
      }
    })
  }

  updateTransactionTypeOrder = async (type: TransactionType): Promise<Responseable> => {
    const orderNumber = type.orderNumber + 1

    return new TransactionTypeController(this.database).update(type._id, {
      orderNumber: orderNumber,
    })
  }

  validateElectronicTransaction = async (
    transactionId: string,
    canceledTransactions: {
      typeId: string
      code: number
      origin: number
      letter: string
      number: number
    },
  ): Promise<Transaction> => {
    return new Promise<Transaction>(async (resolve, reject) => {
      try {
        const transactionController: TransactionController = new TransactionController(
          this.database,
        )

        transactionController.initConnectionDB(this.database)

        let result: Responseable

        result = await transactionController.getAll({
          project: {
            _id: 1,
            origin: 1,
            letter: 1,
            endDate: 1,
            exempt: 1,
            totalPrice: 1,
            operationType: 1,
            taxes: 1,
            optionalAFIP: 1,
            'company.identificationType.code': 1,
            'company.identificationValue': 1,
            'type._id': 1,
            'type.electronics': 1,
            'type.transactionMovement': 1,
            'type.codes': 1,
            'type.finishState': 1,
          },
          match: {_id: {$oid: transactionId}, operationType: {$ne: 'D'}},
        })
        if (result.result.length === 0)
          throw new Error('No se encontro la transacción a validar')

        let transaction: Transaction = result.result[0]

        if (!transaction.type.electronics)
          throw new Error(
            'No se puede validar una transacción que no es de tipo electrónica',
          )
        if (transaction.type.transactionMovement != TransactionMovement.Sale)
          throw new Error('No se puede validar una transacción que no es de tipo Venta')
        if (transaction.CAE)
          throw new Error('No se puede validar una transacción que ya tiene CAE')
        try {
          await this.validateLetter(transaction)
        } catch (e) {
          await this.assignLetter(transaction)
          await this.validateLetter(transaction)
        }

        if (transaction.taxes && transaction.taxes.length > 0) {
          for (let taxes of transaction.taxes) {
            result = await new TaxController(this.database).getAll({
              match: {
                _id: {$oid: taxes.tax},
                operationType: {$ne: 'D'},
              },
            })
            taxes.tax = result.result[0]
          }
        }

        if (!canceledTransactions) {
          result = await new MovementOfCancellationController(this.database).getAll({
            project: {
              _id: 1,
              'transactionOrigin._id': 1,
              'transactionOrigin.origin': 1,
              'transactionOrigin.letter': 1,
              'transactionOrigin.number': 1,
              'transactionOrigin.balance': 1,
              'transactionOrigin.type._id': 1,
              'transactionOrigin.type.movement': 1,
              'transactionOrigin.type.codes': 1,
              'transactionOrigin.type.transactionMovement': 1,
              'transactionOrigin.type.electronics': 1,
              transactionDestination: 1,
              balance: 1,
              operationType: 1,
            },
            match: {
              transactionDestination: {$oid: transactionId},
              operationType: {$ne: 'D'},
            },
          })
          const movementsOfCancellations: MovementOfCancellation[] = result.result

          if (movementsOfCancellations && movementsOfCancellations.length > 0) {
            for (let movementOfCancellation of movementsOfCancellations) {
              let code: number

              if (
                movementOfCancellation.transactionOrigin &&
                movementOfCancellation.transactionOrigin.type &&
                movementOfCancellation.transactionOrigin.type.codes &&
                movementOfCancellation.transactionOrigin.type.electronics
              ) {
                for (let cod of movementOfCancellation.transactionOrigin.type.codes) {
                  if (cod.letter === movementOfCancellation.transactionOrigin.letter) {
                    code = cod.code
                  }
                }
                if (code) {
                  canceledTransactions = {
                    typeId: movementOfCancellation.transactionOrigin.type._id,
                    code,
                    origin: movementOfCancellation.transactionOrigin.origin,
                    letter: movementOfCancellation.transactionOrigin.letter,
                    number: movementOfCancellation.transactionOrigin.number,
                  }
                }
              }
            }
          }
        }

        result = await new ConfigController(this.database).getAll({
          project: {
            _id: 1,
            companyIdentificationValue: 1,
            operationType: 1,
            'companyVatCondition.code': 1,
          },
          match: {
            operationType: {$ne: 'D'},
          },
        })
        const clientConfig: Config = result.result[0] || null

        if (!clientConfig) throw new Error('No se encontro configuración del sistema')

        const bodyConfig = {
          companyIdentificationValue: clientConfig.companyIdentificationValue,
          vatCondition: clientConfig.companyVatCondition.code,
          database: this.database,
        }
        let body: string = `build=${
          config.NODE_ENV === 'production' ? 'prod' : 'test'
        }&transaction=${JSON.stringify(transaction)}&config=${JSON.stringify(bodyConfig)}`

        if (canceledTransactions) {
          body += `&canceledTransactions=${JSON.stringify({
            Tipo: canceledTransactions.code,
            PtoVta: canceledTransactions.origin,
            Nro: canceledTransactions.number,
          })}`
        }

        result = await new CancellationTypeController(this.database).getAll({
          project: {
            operationType: 1,
            'destination._id': 1,
            'destination.name': 1,
            'origin._id': 1,
            'origin.name': 1,
          },
          match: {
            'destination._id': {$oid: transaction.type._id},
            operationType: {$ne: 'D'},
          },
          sort: {order: 1},
        })

        const cancellationTypes: CancellationType[] = result.result

        const newBody = {
          config: bodyConfig,
          transaction: transaction,
          canceledTransactions: canceledTransactions
        }

        console.log(config.API_URL_FE_AR)

        const { data } = await this.api.post(`${config.API_URL_FE_AR}/validate-transaction`, newBody);

        if(!data.data || !data.data.CAE || !data.data.number || !data.data.CAEExpirationDate) {
          throw new Error(data.data.message)
        }

        transaction.number = data.data.number
        transaction.CAE = data.data.CAE
        transaction.CAEExpirationDate = moment(
          data.data.CAEExpirationDate,
          'YYYYMMDD',
        ).toDate()
        const endStatus: TransactionState =
          transaction.type.finishState || TransactionState.Closed

        transaction.state = endStatus
        if (canceledTransactions) {
          let name: string

          if (cancellationTypes && cancellationTypes.length > 0) {
            for (let canc of cancellationTypes) {
              if (canc.origin._id === canceledTransactions.typeId) {
                name = canc.origin.name
              }
            }
          }
          if (name) {
            transaction.observation += ` Corresponde a ${name} ${canceledTransactions.origin}-${canceledTransactions.letter}-${canceledTransactions.number}`
          }
        }
        transaction.state = transaction.type.finishState || TransactionState.Closed

        await this.transactionController.update(transaction._id, {
          number: transaction.number,
          CAE: transaction.CAE,
          CAEExpirationDate: transaction.CAEExpirationDate,
          observation: transaction.observation,
          state: transaction.state,
        })

        resolve(transaction)
      } catch (error) {
        reject(error)
      }
    })
  }

  validateTransaction = async (transaction: Transaction): Promise<Transaction> => {
    return new Promise<Transaction>(async (resolve, reject) => {
      try {
        let result: Responseable

        result = await this.transactionController.getAll({
          project: {_id: 1, operationType: 1, type: 1, company: 1},
          match: {_id: {$oid: transaction._id}, operationType: {$ne: 'D'}},
        })
        if (result.result.length === 0) {
          throw new Error('No se encontró la transacción a actualizar')
        }
        const oldTransaction: Transaction = result.result[0]

        result = await new TransactionTypeController(this.database).getAll({
          project: {
            _id: 1,
            operationType: 1,
            requestArticles: 1,
            electronics: 1,
            transactionMovement: 1,
            orderNumber: 1,
            automaticNumbering: 1,
            maxOrderNumber: 1,
            updatePrice: 1,
            fixedLetter: 1,
          },
          match: {
            _id: {$oid: oldTransaction.type.toString()},
            operationType: {$ne: 'D'},
          },
        })
        if (result.result.length === 0) {
          throw new Error('No se encontró el tipo de la transacción a actualizar')
        }
        transaction.type = result.result[0]

        if (oldTransaction.company) {
          result = await new CompanyController(this.database).getAll({
            project: {
              _id: 1,
              operationType: 1,
            },
            match: {
              _id: {$oid: oldTransaction.company.toString()},
              operationType: {$ne: 'D'},
            },
          })
          if (result.result.length === 0) {
            throw new Error('No se encontró la compañia de la transacción a actualizar')
          }
          oldTransaction.company = result.result[0]
        }

        if (transaction.company) {
          result = await new CompanyController(this.database).getAll({
            project: {
              _id: 1,
              operationType: 1,
              'vatCondition.transactionLetter': 1,
            },
            match: {
              _id: {
                $oid: transaction.company._id || transaction.company.toString(),
              },
              operationType: {$ne: 'D'},
            },
          })
          if (result.result.length === 0) {
            throw new Error('No se encontró la compañia de la transacción a actualizar')
          }
          transaction.company = result.result[0]
        }

        await this.validateState(oldTransaction, transaction)
        await this.validateCAE(oldTransaction, transaction)
        await this.validateTotalPrice(transaction)
        await this.validateNumber(transaction)
        resolve(transaction)
      } catch (error) {
        reject(error)
      }
    })
  }

  validateState = async (
    oldTransaction: Transaction,
    transaction: Transaction,
  ): Promise<Transaction> => {
    return new Promise<Transaction>(async (resolve, reject) => {
      try {
        if (
          transaction.state === TransactionState.Canceled &&
          (transaction.CAE ||
            transaction.SATStamp ||
            transaction.stringSAT ||
            transaction.CFDStamp)
        )
          throw new Error('No se puede anular una transacción ya certificada.')

        if (
          oldTransaction.state === TransactionState.Sent &&
          transaction.state === TransactionState.Packing
        ) {
          throw new Error('No se puede volver al estado de armando')
        }

        if (transaction.state === TransactionState.Canceled) {
          await new MovementOfCashUC(this.database).deleteByTransaction(transaction._id)
          await new MovementOfArticleUC(this.database).deleteByTransaction(
            transaction._id,
          )
        }

        if (transaction.state === TransactionState.Outstanding) {
          this.verifyPayments()
        }

        resolve(transaction)
      } catch (error) {
        reject(error)
      }
    })
  }

  validateCAE = async (
    oldTransaction: Transaction,
    transaction: Transaction,
  ): Promise<Transaction> => {
    return new Promise<Transaction>(async (resolve, reject) => {
      try {
        if (oldTransaction.CAE && !transaction.CAE)
          throw new Error('No se puede volver al estado de CAE')
        resolve(transaction)
      } catch (error) {
        reject(error)
      }
    })
  }

  validateLetter = async (transaction: Transaction): Promise<void> => {
    return new Promise<void>(async (resolve, reject) => {
      try {
        if (transaction.type.electronics && transaction.letter === 'X') {
          throw new Error('Una transacción electrónica no puede ser X')
        }
        resolve()
      } catch (error) {
        reject(error)
      }
    })
  }

  validateNumber = async (transaction: Transaction): Promise<Transaction> => {
    return new Promise<Transaction>(async (resolve, reject) => {
      try {
        if (transaction.number === 0) {
          throw new Error('El número de transacción no puede ser 0')
        }

        let match: any = {
          _id: {$ne: {$oid: transaction._id}},
          operationType: {$ne: 'D'},
          origin: transaction.origin,
          letter: transaction.letter,
          number: transaction.number,
          type: {$oid: transaction.type._id},
          state: TransactionState.Closed,
        }

        if (
          transaction.type.transactionMovement === TransactionMovement.Purchase &&
          transaction.company
        ) {
          match['company'] = transaction.company._id
        }
        let result: Responseable = await this.transactionController.getAll({
          project: {
            _id: 1,
            operationType: 1,
            origin: 1,
            letter: 1,
            number: 1,
            type: 1,
            state: 1,
            company: 1,
          },
          match,
        })
        const transactions: Transaction[] = result.result

        if (transactions.length > 0) {
          if (
            !transaction.type.electronics &&
            transaction.state !== TransactionState.Canceled &&
            !transaction.type.automaticNumbering
          ) {
            throw new Error(
              'La transacción "' +
                transaction.origin +
                '-' +
                transaction.letter +
                '-' +
                transaction.number +
                '" ya existe',
            )
          }
        }
        resolve(transaction)
      } catch (error) {
        reject(error)
      }
    })
  }

  validateTotalPrice = async (transaction: Transaction): Promise<Transaction> => {
    return new Promise<Transaction>(async (resolve, reject) => {
      try {
        this.transactionController.initConnectionDB(this.database)

        let result: Responseable

        if (false) {
          result = await new MovementOfArticleController(this.database).getAll({
            project: {
              transaction: 1,
              operationType: 1,
              salePrice: 1,
              taxes: 1,
            },
            match: {
              transaction: {$oid: transaction._id},
              operationType: {$ne: 'D'},
            },
          })
          let movementsOfArticles: MovementOfArticle[] = result.result
          let totalArticlePrice = 0
          let totalMovementOfArticleTaxAmount = 0

          if (movementsOfArticles && movementsOfArticles.length > 0) {
            for (let movementOfArticle of movementsOfArticles) {
              totalArticlePrice += movementOfArticle.salePrice
              if (movementOfArticle.taxes && movementOfArticle.taxes.length > 0) {
                totalMovementOfArticleTaxAmount = movementOfArticle.taxes.reduce(
                  (accumulator, currentValue) => accumulator + currentValue.taxAmount,
                  0,
                )
              }
            }
          }
          let totalTransactionTaxAmount = 0

          if (transaction.taxes && transaction.taxes.length > 0) {
            totalTransactionTaxAmount = transaction.taxes.reduce(
              (accumulator, currentValue) => accumulator + currentValue.taxAmount,
              0,
            )
          }
          const diffPrice: number =
            transaction.totalPrice -
            (totalTransactionTaxAmount - totalMovementOfArticleTaxAmount) -
            totalArticlePrice

          if (diffPrice > 1 || diffPrice < -1) {
            throw new Error(
              'La suma de precios de artículos debe ser igual al total de la transacción',
            )
          }
        }
        resolve(transaction)
      } catch (error) {
        reject(error)
      }
    })
  }

  verifyPayments = () => {
    this.api.post(
      `${config.API_URL}/mercadopago/verify-payments-by-client`,
      {},
      {headers: {Authorization: this.authToken}},
    )
  }

  async assignLetter(transaction: Transaction): Promise<Transaction> {
    return new Promise<Transaction>(async (resolve, reject) => {
      try {
        let result: Responseable = await new ConfigController(this.database).getAll({
          project: {
            _id: 1,
            country: 1,
            operationType: 1,
            'companyVatCondition.description': 1,
          },
          match: {
            operationType: {$ne: 'D'},
          },
        })
        const clientConfig: Config = result.result[0] || null

        if (!clientConfig) throw new Error('No se encontro configuración del sistema')

        if (transaction.type.fixedLetter && transaction.type.fixedLetter !== '') {
          transaction.letter = transaction.type.fixedLetter.toUpperCase()
        } else {
          if (clientConfig.country === 'AR') {
            if (
              clientConfig.companyVatCondition &&
              clientConfig.companyVatCondition.description === 'Responsable Inscripto'
            ) {
              if (transaction.company && transaction.company.vatCondition) {
                transaction.letter = transaction.company.vatCondition.transactionLetter
              } else {
                transaction.letter = 'B'
              }
            } else if (
              clientConfig.companyVatCondition &&
              clientConfig.companyVatCondition.description === 'Monotributista'
            ) {
              transaction.letter = 'C'
            } else {
              transaction.letter = 'X'
            }
          }
        }

        await this.transactionController.update(transaction._id, {
          letter: transaction.letter,
        })
        resolve(transaction)
      } catch (error) {
        reject(error)
      }
    })
  }

  updateByMovementOfArticle = async (
    movementOfArticle: MovementOfArticle,
  ): Promise<Transaction> => {
    let result: Responseable = await this.transactionController.getAll({
      project: {
        _id: 1,
        taxes: 1,
        exempt: 1,
        totalPrice: 1,
      },
      match: {
        _id: {$oid: movementOfArticle.transaction._id || movementOfArticle.transaction},
      },
    })

    if (result.result.length === 0) throw new Error('No se encontro la transacción')
    const transaction: Transaction = result.result[0]

    if (movementOfArticle.taxes.length > 0) {
      for (let taxes of movementOfArticle.taxes) {
        for (let transactionTax of transaction.taxes) {
          if (taxes.tax._id === transactionTax.tax._id) {
            transactionTax.taxAmount += taxes.taxAmount
          }
        }
      }
    } else {
      transaction.exempt += movementOfArticle.salePrice
    }
    transaction.totalPrice += movementOfArticle.salePrice
    this.transactionController.update(transaction._id, {
      exempt: transaction.exempt,
      taxes: transaction.taxes,
      totalPrice: transaction.totalPrice,
    })

    return transaction
  }

  async updatePrices(transaction: Transaction): Promise<Transaction> {
    let result: Responseable

    transaction.totalPrice = 0

    if (transaction.discountPercent === 0) {
      if (
        transaction.company &&
        transaction.company.discount > 0 &&
        transaction.type.allowCompanyDiscount
      ) {
        transaction.discountPercent += transaction.company.discount
      }
      if (
        transaction.company &&
        transaction.company.group &&
        transaction.company.group.discount > 0 &&
        transaction.type.allowCompanyDiscount
      ) {
        transaction.discountPercent += transaction.company.group.discount
      }
    }

    transaction.discountPercent = roundNumber(transaction.discountPercent, 6)
    if (
      transaction.company &&
      transaction.company.discount > 0 &&
      transaction.type.allowCompanyDiscount
    ) {
      transaction.discountPercent += transaction.company.discount
    }
    if (
      transaction.company &&
      transaction.company.group &&
      transaction.company.group.discount > 0 &&
      transaction.type.allowCompanyDiscount
    ) {
      transaction.discountPercent += transaction.company.group.discount
    }

    result = await new MovementOfArticleController(this.database).getAll({
      project: {transaction: 1, taxes: 1, salePrice: 1},
      match: {
        transaction: {
          $oid: transaction._id ? transaction._id : transaction.toString(),
        },
      },
    })

    const movementsOfArticles: MovementOfArticle[] = result.result

    transaction.totalPrice += movementsOfArticles.reduce(
      (accumulator, currentValue) => accumulator + currentValue.salePrice,
      0,
    )

    if (transaction.type.requestTaxes) {
      transaction.taxes = await this.recalculateTaxes(transaction)
    } else {
      transaction.exempt = transaction.totalPrice
    }

    result = await this.transactionController.update(transaction._id, transaction)

    return result.result
  }

  getTransactionOldApi = async (transactionId: string): Promise<Transaction> => {
    const response = this.api.get(`${config.API_URL}/transaction?id=${transactionId}`, {
      headers: {Authorization: this.authToken},
    })

    return response.data.transaction
  }
}
