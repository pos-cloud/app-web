import * as express from 'express'

import HttpException from '../../exceptions/HttpException'
import authMiddleware from '../../middleware/auth.middleware'
import ensureLic from '../../middleware/license.middleware'
import Responser from '../../utils/responser'
import AccountSeanSchema from '../account-seat/account-seat.model'
import MovementOfArticleController from '../movement-of-article/movement-of-article.controller'

import AccountPeriodController from './../../domains/account-period/account-period.controller'
import AccountPeriod from './../../domains/account-period/account-period.interface'
import AccountSeatController from './../../domains/account-seat/account-seat.controller'
import AccountSeat from './../../domains/account-seat/account-seat.interface'
import MovementOfArticle from './../../domains/movement-of-article/movement-of-article.interface'
import MovementOfCashController from './../../domains/movement-of-cash/movement-of-cash.controller'
import MovementOfCash from './../../domains/movement-of-cash/movement-of-cash.interface'
import TaxController from './../../domains/tax/tax.controller'
import Tax, {TaxClassification} from './../../domains/tax/tax.interface'
import {
  CurrentAccount,
  Movements,
  TransactionMovement,
} from './../../domains/transaction-type/transaction-type.interface'
import TransactionController from './../../domains/transaction/transaction.controller'
import Transaction from './../../domains/transaction/transaction.interface'
import NotFoundException from './../../exceptions/NotFoundException'
import RequestWithUser from './../../interfaces/requestWithUser.interface'
import Responseable from './../../interfaces/responsable.interface'

export default class AccountSeatTransactionController {
  public EJSON: any = require('bson').EJSON
  public path = '/account-seat-transaction'
  public router = express.Router()
  public database: string
  public accountSeat: AccountSeat

  constructor() {
    this.initializeRoutes()
  }

  private initializeRoutes() {
    this.router.post(
      `${this.path}/:transactionId`,
      [authMiddleware, ensureLic],
      this.addAccountSeatByTransaction,
    )
  }

  private addAccountSeatByTransaction = (
    request: RequestWithUser,
    response: express.Response,
    next: express.NextFunction,
    transactionId: string = null,
  ) => {
    try {
      this.database = request.database
      let transaction: Transaction

      this.accountSeat = AccountSeanSchema.getInstance(this.database)

      if (request.params.transactionId) transactionId = request.params.transactionId

      new TransactionController(this.database)
        .getAll({
          project: {
            _id: 1,
            operationType: 1,
            endDate: 1,
            updateDate: 1,
            origin: 1,
            letter: 1,
            number: 1,
            taxes: 1,
            totalPrice: 1,
            'company._id': 1,
            'company.account': 1,
            'type._id': 1,
            'type.transactionMovement': 1,
            'type.requestArticles': 1,
            'type.requestPaymentMethods': 1,
            'type.currentAccount': 1,
            'type.movement': 1,
            'type.requestTaxes': 1,
            'type.operationType': 1,
            account: 1,
          },
          match: {
            _id: {$oid: transactionId},
            operationType: {$ne: 'D'},
            'type.operationType': {$ne: 'D'},
          },
        })
        .then(async (result: Responseable) => {
          if (result.result.length === 0) throw new NotFoundException(transactionId)
          transaction = result.result[0]
          this.accountSeat.date = transaction.endDate
          this.accountSeat.transaction = transaction
          this.accountSeat.period = await this.getPeriod()
          if (
            transaction.type.currentAccount === CurrentAccount.Charge &&
            !transaction.type.requestArticles
          ) {
            if (transaction.type.transactionMovement === TransactionMovement.Sale) {
              this.accountSeat.items.push({
                account: transaction.company.account,
                debit: 0,
                credit: transaction.totalPrice,
              })
            } else {
              this.accountSeat.items.push({
                account: transaction.company.account,
                debit: transaction.totalPrice,
                credit: 0,
              })
            }
            await this.setMovCashByTransaction(transaction)
          } else if (
            transaction.type.requestArticles &&
            transaction.type.requestPaymentMethods
          ) {
            await this.setMovCashByTransaction(transaction)
            await this.setMovArticleByTransaction(transaction)
            await this.setTaxesByTransaction(transaction)
          } else if (
            transaction.type.requestPaymentMethods &&
            !transaction.type.requestArticles &&
            transaction.account
          ) {
            await this.setMovCashByTransaction(transaction)
            await this.setTaxesByTransaction(transaction)
            if (transaction.type.movement === Movements.Inflows) {
              this.accountSeat.items.push({
                account: transaction.account,
                debit: 0,
                credit: transaction.totalPrice,
              })
            } else {
              this.accountSeat.items.push({
                account: transaction.account,
                debit: transaction.totalPrice,
                credit: 0,
              })
            }
          } else {
            throw new Error('Nose encontro configuración para este tipo de transacción')
          }

          response.send(
            await new AccountSeatController(this.database).save(this.accountSeat),
          )
        })
    } catch (error) {
      next(
        new HttpException(new Responser(error.status || 500, null, error.message, error)),
      )
    }
  }

  public groupBy = function (miarray: any, prop: any) {
    return miarray.reduce((groups: any, item: any) => {
      let val = item[prop]

      groups[val] = groups[val] || {account: item.account, debit: 0, credit: 0}
      groups[val].debit += item.debit
      groups[val].credit += item.credit

      return groups
    }, {})
  }

  public setMovArticleByTransaction = async (transaction: Transaction) => {
    return new Promise<Responseable>(async (resolve, reject) => {
      // TRAEMOS DE LA BASE EL MOVIMIENTO DEL ARTÍCULO
      await new MovementOfArticleController(this.database)
        .getAll({
          project: {
            _id: 1,
            operationType: 1,
            transaction: 1,
            taxes: 1,
            unitPrice: 1,
            basePrice: 1,
            salePrice: 1,
            'article._id': 1,
            'article.operationType': 1,
            'article.salesAccount': 1,
            'article.purchaseAccount': 1,
            account: 1,
          },
          match: {
            operationType: {$ne: 'D'},
            transaction: {$oid: transaction._id},
            article: {$exists: true},
            'article.operationType': {$ne: 'D'},
          },
        })
        .then(async (result: Responseable) => {
          if (result.status === 200) {
            if (result.result && result.result.length > 0) {
              const movementsOfArticles: MovementOfArticle[] = result.result

              for (let movementOfArticle of movementsOfArticles) {
                if (transaction.type.transactionMovement === TransactionMovement.Sale) {
                  if (transaction.type.movement === Movements.Inflows) {
                    if (
                      movementOfArticle.article.salesAccount ||
                      movementOfArticle.account
                    ) {
                      let accountAux = movementOfArticle.account
                        ? movementOfArticle.account
                        : movementOfArticle.article.salesAccount

                      if (movementOfArticle.taxes && movementOfArticle.taxes.length > 0) {
                        for (const tax of movementOfArticle.taxes) {
                          let tax2: Tax = await this.getTaxById(tax.tax._id)

                          if (tax2.creditAccount) {
                            this.accountSeat.items.push({
                              account: tax2.creditAccount,
                              debit: 0,
                              credit: tax.taxAmount,
                            })
                            this.accountSeat.items.push({
                              account: accountAux,
                              debit: 0,
                              credit: tax.taxBase,
                            })
                          } else {
                            reject(
                              new HttpException(
                                new Responser(
                                  404,
                                  null,
                                  'Los impuestos no tienen cuenta contable',
                                  'Los impuestos no tienen cuenta contable',
                                ),
                              ),
                            )
                          }
                        }
                        if (transaction.exempt) {
                          this.accountSeat.items.push({
                            account: accountAux,
                            debit: 0,
                            credit: transaction.exempt,
                          })
                        }
                      } else {
                        this.accountSeat.items.push({
                          account: accountAux,
                          debit: 0,
                          credit: movementOfArticle.salePrice,
                        })
                      }
                    } else {
                      reject(
                        new HttpException(
                          new Responser(
                            404,
                            null,
                            'Los Productos de la transaccion no tienen asignada cuenta contable',
                            'Los Productos de la transaccion no tienen asignada cuenta contable',
                          ),
                        ),
                      )
                    }
                  } else if (transaction.type.movement === Movements.Outflows) {
                    if (
                      movementOfArticle.article.salesAccount ||
                      movementOfArticle.account
                    ) {
                      let accountAux = movementOfArticle.account
                        ? movementOfArticle.account
                        : movementOfArticle.article.salesAccount

                      if (movementOfArticle.taxes && movementOfArticle.taxes.length > 0) {
                        for (const tax of movementOfArticle.taxes) {
                          let tax2: Tax = await this.getTaxById(tax.tax._id)

                          if (tax2.debitAccount) {
                            this.accountSeat.items.push({
                              account: tax2.debitAccount,
                              debit: tax.taxAmount,
                              credit: 0,
                            })
                            this.accountSeat.items.push({
                              account: accountAux,
                              debit: tax.taxBase,
                              credit: 0,
                            })
                          } else {
                            reject(
                              new HttpException(
                                new Responser(
                                  404,
                                  null,
                                  'Los impuestos no tienen cuenta contable',
                                  'Los impuestos no tienen cuenta contable',
                                ),
                              ),
                            )
                          }
                        }
                        if (transaction.exempt) {
                          this.accountSeat.items.push({
                            account: accountAux,
                            debit: transaction.exempt,
                            credit: 0,
                          })
                        }
                      } else {
                        this.accountSeat.items.push({
                          account: accountAux,
                          debit: movementOfArticle.salePrice,
                          credit: 0,
                        })
                      }
                    } else {
                      reject(
                        new HttpException(
                          new Responser(
                            404,
                            null,
                            'Los Productos de la transaccion no tienen asignada cuenta contable',
                            'Los Productos de la transaccion no tienen asignada cuenta contable',
                          ),
                        ),
                      )
                    }
                  } else {
                    reject(
                      new HttpException(
                        new Responser(
                          404,
                          null,
                          'Error tipo de transaccion',
                          'No se encontro movimiento de dinero para esta transaccion',
                        ),
                      ),
                    )
                  }
                } else if (
                  transaction.type.transactionMovement === TransactionMovement.Purchase
                ) {
                  if (transaction.type.movement === Movements.Inflows) {
                    if (
                      movementOfArticle.article.purchaseAccount ||
                      movementOfArticle.account
                    ) {
                      let accountAux = movementOfArticle.account
                        ? movementOfArticle.account
                        : movementOfArticle.article.purchaseAccount

                      if (movementOfArticle.taxes && movementOfArticle.taxes.length > 0) {
                        for (const tax of movementOfArticle.taxes) {
                          let tax2: Tax = await this.getTaxById(tax.tax._id)

                          if (tax2.creditAccount) {
                            this.accountSeat.items.push({
                              account: tax2.creditAccount,
                              debit: 0,
                              credit: tax.taxAmount,
                            })
                            this.accountSeat.items.push({
                              account: accountAux,
                              debit: 0,
                              credit: tax.taxBase,
                            })
                          } else {
                            reject(
                              new HttpException(
                                new Responser(
                                  404,
                                  null,
                                  'Los impuestos no tienen cuenta contable',
                                  'Los impuestos no tienen cuenta contable',
                                ),
                              ),
                            )
                          }
                        }
                        if (transaction.exempt) {
                          this.accountSeat.items.push({
                            account: accountAux,
                            debit: 0,
                            credit: transaction.exempt,
                          })
                        }
                      } else {
                        this.accountSeat.items.push({
                          account: accountAux,
                          debit: 0,
                          credit: movementOfArticle.salePrice,
                        })
                      }
                    } else {
                      reject(
                        new HttpException(
                          new Responser(
                            404,
                            null,
                            'Los Productos de la transaccion no tienen asignada cuenta contable',
                            'Los Productos de la transaccion no tienen asignada cuenta contable',
                          ),
                        ),
                      )
                    }
                  } else if (transaction.type.movement === Movements.Outflows) {
                    if (
                      movementOfArticle.article.purchaseAccount ||
                      movementOfArticle.account
                    ) {
                      let accountAux = movementOfArticle.account
                        ? movementOfArticle.account
                        : movementOfArticle.article.purchaseAccount

                      if (movementOfArticle.taxes && movementOfArticle.taxes.length > 0) {
                        for (const tax of movementOfArticle.taxes) {
                          let tax2: Tax = await this.getTaxById(tax.tax._id)

                          if (tax2.debitAccount) {
                            this.accountSeat.items.push({
                              account: tax2.debitAccount,
                              debit: tax.taxAmount,
                              credit: 0,
                            })
                            this.accountSeat.items.push({
                              account: accountAux,
                              debit: tax.taxBase,
                              credit: 0,
                            })
                          } else {
                            reject(
                              new HttpException(
                                new Responser(
                                  404,
                                  null,
                                  'Los impuestos no tienen cuenta contable',
                                  'Los impuestos no tienen cuenta contable',
                                ),
                              ),
                            )
                          }
                        }
                        if (transaction.exempt) {
                          this.accountSeat.items.push({
                            account: accountAux,
                            debit: transaction.exempt,
                            credit: 0,
                          })
                        }
                      } else {
                        this.accountSeat.items.push({
                          account: accountAux,
                          debit: movementOfArticle.salePrice,
                          credit: 0,
                        })
                      }
                    } else {
                      reject(
                        new HttpException(
                          new Responser(
                            404,
                            null,
                            'Los Productos de la transaccion no tienen asignada cuenta contable',
                            'Los Productos de la transaccion no tienen asignada cuenta contable',
                          ),
                        ),
                      )
                    }
                  } else {
                    reject(
                      new HttpException(
                        new Responser(
                          404,
                          null,
                          'Error tipo de transaccion',
                          'No se encontro movimiento de dinero para esta transaccion',
                        ),
                      ),
                    )
                  }
                } else if (
                  transaction.type.transactionMovement === TransactionMovement.Stock
                ) {
                } else if (
                  transaction.type.transactionMovement === TransactionMovement.Money
                ) {
                } else {
                  reject(
                    new HttpException(
                      new Responser(
                        404,
                        null,
                        'Error tipo de transaccion',
                        'No se encontro movimiento para esta transaccion',
                      ),
                    ),
                  )
                }
              }
              resolve(result)
            } else {
              reject(
                new HttpException(
                  new Responser(
                    404,
                    null,
                    'No se encontraron productos en la transacción',
                    'No se encontraron productos en la transacción',
                  ),
                ),
              )
            }
          } else
            reject(
              new HttpException(
                new Responser(result.status, null, result.message, result),
              ),
            )
        })
        .catch((error: Responseable) =>
          reject(new HttpException(new Responser(500, null, error.message, error))),
        )
    })
  }

  public setMovCashByTransaction = async (transaction: Transaction) => {
    return new Promise<Responseable>(async (resolve, reject) => {
      // TRAEMOS DE LA BASE EL MOVIMIENTO DEL ARTÍCULO
      await new MovementOfCashController(this.database)
        .getAll({
          project: {
            _id: 1,
            operationType: 1,
            transaction: 1,
            amountPaid: 1,
            'bank._id': 1,
            'bank.account': 1,
            'type._id': 1,
            'type.account': 1,
            'type.isCurrentAccount': 1,
            'type.allowBank': 1,
            'type.operationType': 1,
          },
          match: {
            operationType: {$ne: 'D'},
            transaction: {$oid: transaction._id},
            type: {$exists: true},
            'type.operationType': {$ne: 'D'},
          },
        })
        .then(async (result: Responseable) => {
          if (result.status === 200) {
            if (result.result && result.result.length > 0) {
              const movementsOfCash: MovementOfCash[] = result.result

              for (let movementOfCash of movementsOfCash) {
                switch (transaction.type.movement) {
                  case Movements.Inflows:
                    if (movementOfCash.type.isCurrentAccount) {
                      if (transaction.company.account) {
                        this.accountSeat.items.push({
                          account: transaction.company.account,
                          debit: movementOfCash.amountPaid,
                          credit: 0,
                        })
                      } else {
                        reject(
                          new HttpException(
                            new Responser(
                              404,
                              null,
                              'Cliente sin cuenta',
                              'Debe asignar una cuenta a la empresa asignada para movimientos de cuenta corriente',
                            ),
                          ),
                        )
                      }
                    } else if (
                      movementOfCash.type.allowBank &&
                      movementOfCash.bank &&
                      movementOfCash.bank.account
                    ) {
                      this.accountSeat.items.push({
                        account: movementOfCash.bank.account,
                        debit: movementOfCash.amountPaid,
                        credit: 0,
                      })
                    } else if (movementOfCash.type.account) {
                      this.accountSeat.items.push({
                        account: movementOfCash.type.account,
                        debit: movementOfCash.amountPaid,
                        credit: 0,
                      })
                    } else {
                      reject(
                        new HttpException(
                          new Responser(
                            404,
                            null,
                            'Los metodos de pago de la transaccion no tienen asignada cuenta contable',
                            'Los metodo de pago de la transaccion no tienen asignada cuenta contable',
                          ),
                        ),
                      )
                    }
                    break
                  case Movements.Outflows:
                    if (movementOfCash.type.isCurrentAccount) {
                      if (transaction.company.account) {
                        this.accountSeat.items.push({
                          account: transaction.company.account,
                          debit: 0,
                          credit: movementOfCash.amountPaid,
                        })
                      } else {
                        reject(
                          new HttpException(
                            new Responser(
                              404,
                              null,
                              'Cliente sin cuenta',
                              'Debe asignar una cuenta a la empresa asignada para movimientos de cuenta corriente',
                            ),
                          ),
                        )
                      }
                    } else if (
                      movementOfCash.type.allowBank &&
                      movementOfCash.bank &&
                      movementOfCash.bank.account
                    ) {
                      this.accountSeat.items.push({
                        account: movementOfCash.bank.account,
                        debit: 0,
                        credit: movementOfCash.amountPaid,
                      })
                    } else if (movementOfCash.type.account) {
                      this.accountSeat.items.push({
                        account: movementOfCash.type.account,
                        debit: 0,
                        credit: movementOfCash.amountPaid,
                      })
                    } else {
                      reject(
                        new HttpException(
                          new Responser(
                            404,
                            null,
                            'Los metodos de pago de la transaccion no tienen asignada cuenta contable',
                            'Los metodo de pago de la transaccion no tienen asignada cuenta contable',
                          ),
                        ),
                      )
                    }
                    break
                  default:
                    reject(
                      new HttpException(
                        new Responser(
                          404,
                          null,
                          'No se encontro movimiento para esta transaccion',
                          'No se encontro movimiento para esta transaccion',
                        ),
                      ),
                    )
                    break
                }
              }
              resolve(result)
            } else {
              reject(
                new HttpException(
                  new Responser(
                    404,
                    null,
                    'No se encontraron productos en la transacción',
                    'No se encontraron productos en la transacción',
                  ),
                ),
              )
            }
          } else
            reject(
              new HttpException(
                new Responser(result.status, null, result.message, result),
              ),
            )
        })
        .catch((error: Responseable) =>
          reject(new HttpException(new Responser(500, null, error.message, error))),
        )
    })
  }

  public setTaxesByTransaction = async (transaction: Transaction) => {
    return new Promise<Boolean>(async (resolve, reject) => {
      if (transaction.taxes && transaction.taxes.length > 0) {
        for (let taxAux of transaction.taxes) {
          let tax: Tax = await this.getTaxById(taxAux.tax.toString())

          if (
            tax.classification == TaxClassification.Perception ||
            tax.classification == TaxClassification.Withholding
          ) {
            if (transaction.type.movement === Movements.Inflows) {
              this.accountSeat.items.push({
                account: tax.creditAccount,
                debit: 0,
                credit: taxAux.taxAmount,
              })
            } else {
              this.accountSeat.items.push({
                account: tax.creditAccount,
                debit: taxAux.taxAmount,
                credit: 0,
              })
            }
          }
        }
        resolve(true)
      } else {
        resolve(true)
      }
    })
  }

  public getTaxById = async (id: string) => {
    return new Promise<Tax>(async (resolve, reject) => {
      // TRAEMOS DE LA BASE EL MOVIMIENTO DEL ARTÍCULO
      await new TaxController(this.database)
        .getById(id)
        .then(async (result: Responseable) => {
          if (result.status === 200) {
            if (result.result) {
              resolve(result.result)
            } else {
              reject(
                new HttpException(
                  new Responser(
                    404,
                    null,
                    'No se encontraron cuentas contable en el impuesto',
                    'No se encontraron cuentas contable en el impuesto',
                  ),
                ),
              )
            }
          } else
            reject(
              new HttpException(
                new Responser(result.status, null, result.message, result),
              ),
            )
        })
        .catch((error: Responseable) =>
          reject(new HttpException(new Responser(500, null, error.message, error))),
        )
    })
  }

  public getPeriod = async () => {
    return new Promise<AccountPeriod>(async (resolve, reject) => {
      // TRAEMOS DE LA BASE EL MOVIMIENTO DEL ARTÍCULO
      await new AccountPeriodController(this.database)
        .getAll({
          match: {
            status: 'Abierto',
          },
        })
        .then(async (result: Responseable) => {
          if (result.status === 200) {
            if (result.result && result.result.length === 1) {
              resolve(result.result[0])
            } else {
              reject(
                new HttpException(
                  new Responser(
                    404,
                    null,
                    'No se encontro periodo contable abierto',
                    'No se encontro periodo contable abierto',
                  ),
                ),
              )
            }
          } else
            reject(
              new HttpException(
                new Responser(result.status, null, result.message, result),
              ),
            )
        })
        .catch((error: Responseable) =>
          reject(new HttpException(new Responser(500, null, error.message, error))),
        )
    })
  }
}
