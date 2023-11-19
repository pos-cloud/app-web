import * as moment from 'moment'

import Deposit from './../../domains/deposit/deposit.interface'
import MovementOfArticleController from './../../domains/movement-of-article/movement-of-article.controller'
import MovementOfArticle from './../../domains/movement-of-article/movement-of-article.interface'
import MovementOfArticleUC from './../../domains/movement-of-article/movement-of-article.uc'
import TransactionController from './../../domains/transaction/transaction.controller'
import Transaction, {
  TransactionState,
} from './../../domains/transaction/transaction.interface'
import NotFoundException from './../../exceptions/NotFoundException'
import Responseable from './../../interfaces/responsable.interface'
import BusinessRulesController from './business-rule.controller'
import {DiscountType} from './business-rule.dto'
import BusinessRule from './business-rule.interface'
import BusinessRuleSchema from './business-rule.model'

export default class BusinessRulesUC {
  businessRulesController: BusinessRulesController
  database: string

  constructor(database: string) {
    this.database = database
    this.businessRulesController = new BusinessRulesController(database)
  }

  async create(businessRule: BusinessRule): Promise<BusinessRule> {
    if (!businessRule) {
      throw new Error(`Debe informar un regla válida`)
    }
    if (!businessRule._id || businessRule._id === '') {
      businessRule = Object.assign(
        BusinessRuleSchema.getInstance(this.database),
        businessRule,
      )
    }
    let result: Responseable

    do {
      businessRule.code = this.generateCode()
      result = await this.businessRulesController.getAll({
        project: {_id: 1, code: 1},
        match: {code: businessRule.code},
      })
    } while (result.result.length > 0)
    businessRule.currentStock = businessRule.totalStock
    result = await this.businessRulesController.save(businessRule)

    return result.result
  }

  generateCode(): string {
    const length = 6
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    const charactersLength = characters.length
    let result = ''

    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength))
    }

    return result
  }

  async applyBusinessRule(
    code: string,
    transactionId: string,
  ): Promise<{
    businessRuleId: string
    movementOfArticleId: string
    discount: number
  }> {
    let result: Responseable = await new TransactionController(this.database).getAll({
      project: {_id: 1, state: 1, totalPrice: 1, 'type._id': 1},
      match: {_id: {$oid: transactionId}},
    })

    if (result.result.length === 0) {
      throw new NotFoundException(transactionId)
    }
    const transaction = result.result[0]

    result = await this.businessRulesController.getAll({
      project: {
        _id: 1,
        code: 1,
        startDate: 1,
        endDate: 1,
        active: 1,
        totalStock: 1,
        currentStock: 1,
        discountType: 1,
        discountValue: 1,
        transactionAmountLimit: 1,
        minQuantity: 1,
        minAmount: 1,
        transactionTypeIds: 1,
        days: 1,
        'article._id': 1,
        'item._id': 1,
        'item2._id': 1,
        'item3._id': 1,
      },
      match: {code: code},
    })
    if (result.result.length === 0) {
      throw new Error(`Código ${code} no se encuentra registrado`)
    }
    const businessRule: BusinessRule = result.result[0]
    let movementsOfArticles: MovementOfArticle[] = []

    let itemIds: {$oid: string}[] = []

    if (businessRule.item) itemIds.push({$oid: businessRule.item._id})
    if (businessRule.item2) itemIds.push({$oid: businessRule.item2._id})
    if (businessRule.item3) itemIds.push({$oid: businessRule.item3._id})

    if (itemIds.length > 0) {
      const movementsOfArticlesResponse: Responseable =
        await new MovementOfArticleController(this.database).getAll({
          project: {
            _id: 1,
            amount: 1,
            quantity: 1,
            salePrice: 1,
            'article._id': 1,
            'transaction._id': 1,
          },
          match: {
            'article._id': {$in: itemIds},
            'transaction._id': {$oid: transactionId},
          },
        })

      movementsOfArticles = movementsOfArticlesResponse.result
    }

    await this.validateBusinessRule(transaction, movementsOfArticles, businessRule)
    const discount = await this.calculateDiscount(
      transaction,
      movementsOfArticles,
      businessRule,
    )

    await this.discountStock(businessRule)
    const salePrice = -discount
    const quantity = 1
    const recalculateParent = false
    const deposit: Deposit = null
    const movementOfParent: MovementOfArticle = null
    const movementOfArticle: MovementOfArticle = await new MovementOfArticleUC(
      this.database,
    ).createMovementOfArticle(
      transactionId,
      businessRule.article._id,
      quantity,
      salePrice,
      recalculateParent,
      deposit,
      movementOfParent,
      businessRule,
    )

    await new TransactionController(this.database).update(transactionId, {
      businessRules: [businessRule],
    })

    return {
      businessRuleId: businessRule._id,
      movementOfArticleId: movementOfArticle._id,
      discount: discount,
    }
  }

  async validateBusinessRule(
    transaction: Transaction,
    movementsOfArticles: MovementOfArticle[],
    businessRule: BusinessRule,
  ): Promise<boolean> {
    if (
      transaction.state !== TransactionState.Open &&
      transaction.state !== TransactionState.Pending
    ) {
      throw new Error(
        'No se puede cargar una promoción si la transacción no esta abierta o pendiente',
      )
    }
    if (!businessRule.active) {
      throw new Error(`La regla no se encuentra activa`)
    }
    await this.wasThePromotionApplied(businessRule)
    this.haveStock(businessRule)
    this.isItBetweenDates(transaction, businessRule)
    this.isItBetweenAmounts(transaction, businessRule)
    this.isItBetweenQuantities(movementsOfArticles, businessRule)
    this.isItOnAValidTransactionType(businessRule, transaction.type._id)
    this.isItOnAValidDay(businessRule)

    return true
  }

  isItBetweenDates(transaction: Transaction, businessRule: BusinessRule): void {
    if (businessRule.startDate) {
      const days = moment(
        moment(businessRule.startDate).format('YYYY-MM-DD'),
        'YYYY-MM-DD',
      ).diff(moment().format('YYYY-MM-DD'), 'days')

      if (days > 0) {
        throw new Error('La promoción aun no esta disponible')
      }
    }

    if (businessRule.endDate) {
      const days = moment(
        moment(businessRule.endDate).format('YYYY-MM-DD'),
        'YYYY-MM-DD',
      ).diff(moment().format('YYYY-MM-DD'), 'days')

      if (days < 0) {
        throw new Error('La promoción ha expirado')
      }
    }
  }

  isItOnAValidTransactionType(
    businessRule: BusinessRule,
    transactionTypeIdFound: string,
  ): void {
    if (businessRule.transactionTypeIds && businessRule.transactionTypeIds.length > 0) {
      if (
        businessRule.transactionTypeIds.filter(
          (transactionTypeId) =>
            transactionTypeId.toString() === transactionTypeIdFound.toString(),
        ).length === 0
      ) {
        throw new Error('La promoción no se aplica en este tipo de transacción')
      }
    }

    return
  }

  isItOnAValidDay(businessRule: BusinessRule): void {
    if (businessRule.days && businessRule.days.length > 0) {
      moment.locale('en')
      const dayMoment: string = moment().format('dddd')

      moment.locale('es')
      if (businessRule.days.filter((day) => day === dayMoment).length === 0) {
        throw new Error('La promoción no se aplica en este día')
      }
    }

    return
  }

  isItBetweenAmounts(transaction: Transaction, businessRule: BusinessRule): void {
    if (businessRule.minAmount && transaction.totalPrice < businessRule.minAmount) {
      throw new Error(`La transacción se encuentra debajo del monto mínimo de la regla`)
    }
  }

  async wasThePromotionApplied(businessRule: BusinessRule) {
    const movementsOfArticlesResponse: Responseable =
      await new MovementOfArticleController(this.database).getAll({
        project: {
          _id: 1,
          operationType: 1,
          'businessRule._id': 1,
        },
        match: {
          operationType: {$ne: 'D'},
          'businessRule._id': {$oid: businessRule._id},
        },
      })

    if (movementsOfArticlesResponse.result.length > 0) {
      throw new Error(`La regla ya fue aplicada a la transacción`)
    }
  }

  isItBetweenQuantities(
    movementsOfArticles: MovementOfArticle[],
    businessRule: BusinessRule,
  ): void {
    if (businessRule.item) {
      const totalQuantity = movementsOfArticles.reduce((total, movementOfArticle) => {
        if (
          movementOfArticle.article._id.toString() === businessRule.item._id.toString()
        ) {
          return total + movementOfArticle.amount
        } else {
          return total
        }
      }, 0)

      if (totalQuantity < businessRule.minQuantity) {
        throw new Error(
          `La Promoción no aplica ya que se encuentra debajo de la cantidad mínima de la regla del producto`,
        )
      }
    }

    if (businessRule.item2) {
      const totalQuantity = movementsOfArticles.reduce((total, movementOfArticle) => {
        if (
          movementOfArticle.article._id.toString() === businessRule.item2._id.toString()
        ) {
          return total + movementOfArticle.amount
        } else {
          return total
        }
      }, 0)

      if (totalQuantity < businessRule.minQuantity) {
        throw new Error(
          `La Promoción no aplica ya que se encuentra debajo de la cantidad mínima de la regla del producto`,
        )
      }
    }

    if (businessRule.item3) {
      const totalQuantity = movementsOfArticles.reduce((total, movementOfArticle) => {
        if (
          movementOfArticle.article._id.toString() === businessRule.item3._id.toString()
        ) {
          return total + movementOfArticle.amount
        } else {
          return total
        }
      }, 0)

      if (totalQuantity < businessRule.minQuantity) {
        throw new Error(
          `La Promoción no aplica ya que se encuentra debajo de la cantidad mínima de la regla del producto`,
        )
      }
    }

    return
  }

  haveStock(businessRule: BusinessRule): void {
    if (businessRule.currentStock <= 0) {
      throw new Error(`No se encuentran mas promociones disponibles`)
    }
  }

  async discountStock(businessRule: BusinessRule): Promise<void> {
    await this.businessRulesController.update(businessRule._id, {
      $inc: {currentStock: -1},
    })
  }

  async calculateDiscount(
    transaction: Transaction,
    movementsOfArticles: MovementOfArticle[],
    businessRule: BusinessRule,
  ): Promise<number> {
    let discount: number = 0
    let totalPrice: number = 0
    let totalQuantity: number = 0

    if (businessRule.item && movementsOfArticles && movementsOfArticles.length > 0) {
      totalPrice = movementsOfArticles.reduce((total, movementOfArticle) => {
        return total + movementOfArticle.salePrice
      }, 0)
      totalQuantity = movementsOfArticles.reduce((total, movementOfArticle) => {
        return total + movementOfArticle.amount
      }, 0)
    } else {
      totalPrice = transaction.totalPrice
    }
    switch (businessRule.discountType) {
      case DiscountType.Amount:
        if (businessRule.item) {
          discount = businessRule.discountValue * totalQuantity
        } else {
          discount = businessRule.discountValue
        }
        if (
          businessRule.transactionAmountLimit &&
          discount > businessRule.transactionAmountLimit
        ) {
          discount = businessRule.transactionAmountLimit
        }
        break
      case DiscountType.Percentage:
        discount = (totalPrice * businessRule.discountValue) / 100
        if (
          businessRule.transactionAmountLimit > 0 &&
          discount > businessRule.transactionAmountLimit
        ) {
          discount = businessRule.transactionAmountLimit
        }
        break
      default:
        throw new Error(`Tipo de descuento no soportado`)
    }

    return discount
  }

  async returnStockByTransaction(transactionId: string): Promise<void> {
    const transactionsResponse: Responseable = await new TransactionController(
      this.database,
    ).getAll({
      project: {
        _id: 1,
      },
      match: {
        _id: {$oid: transactionId},
        'businessRules._id': 1,
      },
    })

    if (transactionsResponse.result.length > 0) {
      const transaction: Transaction = transactionsResponse.result[0]

      if (transaction.businessRules && transaction.businessRules.length > 0) {
        for (let businessRule of transaction.businessRules) {
          await this.businessRulesController.update(businessRule._id, {
            $inc: {currentStock: 1},
          })
        }
      }
    }

    return
  }

  async returnStockById(businessRuleId: string) {
    return this.businessRulesController.update(businessRuleId, {
      $inc: {currentStock: 1},
    })
  }
}
