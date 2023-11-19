import MovementOfArticleSchema from '../movement-of-article/movement-of-article.model'

import {ArticleFieldType} from './../../domains/article-field/article-field.interface'
import {ArticleFields} from './../../domains/article-field/article-fields.interface'
import ArticleStockController from './../../domains/article-stock/article-stock.controller'
import ArticleController from './../../domains/article/article.controller'
import Article from './../../domains/article/article.interface'
import BusinessRule from './../../domains/business-rule/business-rule.interface'
import BusinessRulesUC from './../../domains/business-rule/business-rule.uc'
import ConfigController from './../../domains/config/config.controller'
import Config from './../../domains/config/config.interface'
import Deposit from './../../domains/deposit/deposit.interface'
import TaxController from './../../domains/tax/tax.controller'
import {TaxBase} from './../../domains/tax/tax.interface'
import Taxes from './../../domains/tax/taxes.interface'
import {TransactionMovement} from './../../domains/transaction-type/transaction-type.interface'
import TransactionController from './../../domains/transaction/transaction.controller'
import Transaction, { TransactionState } from './../../domains/transaction/transaction.interface'
import TransactionUC from './../../domains/transaction/transaction.uc'
import HttpException from './../../exceptions/HttpException'
import Responseable from './../../interfaces/responsable.interface'
import Responser from './../../utils/responser'
import {roundNumber} from './../../utils/roundNumber'
import MovementOfArticleController from './movement-of-article.controller'
import MovementOfArticle from './movement-of-article.interface'

export default class MovementOfArticleUC {
  database: string
  movementOfArticleController: MovementOfArticleController
  transactionController: TransactionController

  constructor(database: string) {
    this.database = database
    this.movementOfArticleController = new MovementOfArticleController(database)
    this.transactionController = new TransactionController(database)
  }

  createMovementOfArticle = async (
    transactionId: string,
    articleId: string,
    quantity: number,
    salePrice: number,
    recalculateParent: boolean = true,
    deposit: Deposit = null,
    movementParent?: MovementOfArticle,
    businessRule?: BusinessRule,
  ): Promise<MovementOfArticle> => {
    let movementOfArticle: MovementOfArticle = MovementOfArticleSchema.getInstance(
      this.database,
    )
    let config: Config
    let transaction: Transaction
    let article: Article

    await new ConfigController(this.database)
      .getAll({match: {operationType: {$ne: 'D'}}})
      .then(async (result: Responseable) => (config = result.result[0]))
    await new TransactionController(this.database)
      .getAll({
        project: {
          _id: 1,
          quotation: 1,
          'type._id': 1,
          'type.modifyStock': 1,
          'type.stockMovement': 1,
          'type.requestTaxes': 1,
          'type.transactionMovement': 1,
        },
        match: {_id: {$oid: transactionId}},
      })
      .then(async (result: Responseable) => {
        transaction = result.result[0]
      })

    await new ArticleController(this.database)
      .getAll({
        project: {
          _id: 1,
          code: 1,
          codeSAT: 1,
          description: 1,
          observation: 1,
          make: 1,
          category: 1,
          otherFields: 1,
          basePrice: 1,
          costPrice: 1,
          markupPercentage: 1,
          markupPrice: 1,
          salePrice: 1,
          'taxes.tax': 1,
          'taxes.percentage': 1,
          'taxes.taxBase': 1,
          'taxes.taxAmount': 1,
          'currency._id': 1,
        },
        match: {_id: {$oid: articleId}},
      })
      .then(async (result: Responseable) => (article = result.result[0]))

    movementOfArticle.article = article
    movementOfArticle.code = article.code
    movementOfArticle.codeSAT = article.codeSAT
    movementOfArticle.description = article.description
    movementOfArticle.observation = article.observation
    movementOfArticle.make = article.make
    movementOfArticle.category = article.category
    movementOfArticle.transaction = transaction
    movementOfArticle.modifyStock = transaction.type.modifyStock
    movementOfArticle.businessRule = businessRule
    movementOfArticle.otherFields = article.otherFields
    movementOfArticle.amount = quantity !== undefined ? quantity : 1
    article.salePrice = salePrice
    movementOfArticle.salePrice = roundNumber(
      article.salePrice * movementOfArticle.amount,
    )
    movementOfArticle.basePrice = roundNumber(
      article.basePrice * movementOfArticle.amount,
    )
    movementOfArticle.recalculateParent = recalculateParent
    movementOfArticle.deposit = deposit ? deposit : transaction.depositDestination

    movementOfArticle.movementParent = movementParent ? movementParent : null

    if (transaction.type.stockMovement)
      movementOfArticle.stockMovement = transaction.type.stockMovement

    let quotation = 1

    if (transaction.quotation) quotation = transaction.quotation

    if (
      article.currency &&
      config.currency &&
      config.currency._id !== article.currency._id
    ) {
      movementOfArticle.basePrice = roundNumber(movementOfArticle.basePrice * quotation)
      movementOfArticle.salePrice = roundNumber(movementOfArticle.salePrice * quotation)
    }

    if (
      transaction &&
      transaction.type &&
      transaction.type.transactionMovement === TransactionMovement.Sale
    ) {
      let fields: ArticleFields[] = new Array()

      if (movementOfArticle.otherFields && movementOfArticle.otherFields.length > 0) {
        for (const field of movementOfArticle.otherFields) {
          if (
            field.articleField.datatype === ArticleFieldType.Percentage ||
            field.articleField.datatype === ArticleFieldType.Number
          ) {
            if (field.articleField.datatype === ArticleFieldType.Percentage) {
              field.amount = roundNumber(
                (movementOfArticle.basePrice * parseFloat(field.value)) / 100,
              )
            } else if (field.articleField.datatype === ArticleFieldType.Number) {
              field.amount = parseFloat(field.value)
            }
          }
          fields.push(field)
        }
      }

      movementOfArticle.otherFields = fields
      movementOfArticle.costPrice = roundNumber(
        article.costPrice * movementOfArticle.amount,
      )
      movementOfArticle.unitPrice = roundNumber(
        movementOfArticle.salePrice / movementOfArticle.amount,
      )
      movementOfArticle.markupPrice = roundNumber(
        movementOfArticle.salePrice - movementOfArticle.costPrice,
      )
      movementOfArticle.markupPercentage = roundNumber(
        (movementOfArticle.markupPrice / movementOfArticle.costPrice) * 100,
        3,
      )

      if (transaction.type.requestTaxes) {
        let taxes: Taxes[] = new Array()

        if (article.taxes && article.taxes.length > 0) {
          let impInt: number = 0

          for (let taxAux of article.taxes)
            if (taxAux.percentage === 0)
              impInt = roundNumber(taxAux.taxAmount * movementOfArticle.amount, 4)
          for (let taxAux of article.taxes) {
            await new TaxController(this.database)
              .getAll({match: {_id: {$oid: taxAux.tax}}})
              .then((result: Responseable) => {
                if (result.result.length === 0)
                  throw new HttpException(
                    new Responser(
                      404,
                      null,
                      `not tax ${taxAux.tax} found`,
                      `not tax ${taxAux.tax} found`,
                    ),
                  )
                taxAux.tax = result.result[0]
              })
            let taxBase: number =
              taxAux.tax.taxBase == TaxBase.Neto
                ? roundNumber(
                    (movementOfArticle.salePrice - impInt) /
                      (taxAux.percentage / 100 + 1),
                    4,
                  )
                : 0
            let taxAmount: number = 0

            if (taxAux.percentage === 0)
              taxAmount = roundNumber(taxAux.taxAmount * movementOfArticle.amount, 4)
            else taxAmount = roundNumber((taxBase * taxAux.percentage) / 100, 4)

            let tax: Taxes = {
              tax: taxAux.tax,
              percentage: roundNumber(taxAux.percentage),
              taxAmount: roundNumber(taxAmount),
              taxBase,
            }

            taxes.push(tax)
          }
        }
        movementOfArticle.taxes = taxes
      }
    } else {
      movementOfArticle.markupPercentage = 0
      movementOfArticle.markupPrice = 0

      let taxedAmount = movementOfArticle.basePrice

      movementOfArticle.costPrice = 0

      let fields: ArticleFields[] = new Array()

      if (movementOfArticle.otherFields && movementOfArticle.otherFields.length > 0) {
        for (const field of movementOfArticle.otherFields) {
          if (
            field.articleField.datatype === ArticleFieldType.Percentage ||
            field.articleField.datatype === ArticleFieldType.Number
          ) {
            if (field.articleField.datatype === ArticleFieldType.Percentage) {
              field.amount = roundNumber(
                (movementOfArticle.basePrice * parseFloat(field.value)) / 100,
              )
            } else if (field.articleField.datatype === ArticleFieldType.Number) {
              field.amount = parseFloat(field.value)
            }
            if (field.articleField.modifyVAT) {
              taxedAmount += field.amount
            } else {
              movementOfArticle.costPrice += field.amount
            }
          }
          fields.push(field)
        }
      }
      movementOfArticle.otherFields = fields
      if (transaction.type.requestTaxes) {
        let taxes: Taxes[] = new Array()

        if (article.taxes && article.taxes.length > 0) {
          for (let taxAux of article.taxes) {
            taxAux.tax = taxAux.tax
            taxAux.taxBase = roundNumber(taxedAmount)
            if (taxAux.percentage !== 0)
              taxAux.taxAmount = roundNumber((taxAux.taxBase * taxAux.percentage) / 100)
            taxes.push(taxAux)
            movementOfArticle.costPrice += taxAux.taxAmount
          }
          movementOfArticle.taxes = taxes
        }
      }
      movementOfArticle.costPrice += roundNumber(taxedAmount)
      movementOfArticle.unitPrice = movementOfArticle.basePrice
      movementOfArticle.salePrice = movementOfArticle.costPrice
    }

    movementOfArticle = await new MovementOfArticleController(
      this.database,
    ).saveMovementOfArticle(movementOfArticle)
    await new TransactionUC(this.database).updateByMovementOfArticle(movementOfArticle)

    return movementOfArticle
  }

  deleteByTransaction = async (transactionId: string): Promise<boolean> => {
    return new Promise<boolean>(async (resolve, reject) => {
      try {
        let result: Responseable
        let movementsOfArticles: MovementOfArticle[]

        result = await this.movementOfArticleController.getAll({
          project: {_id: 1, transaction: 1},
          match: {transaction: {$oid: transactionId}},
        })
        movementsOfArticles = result.result
        movementsOfArticles.forEach(async (movementOfArticle: MovementOfArticle) => {
          await this.deleteMovementOfArticle(movementOfArticle._id)
        })
        resolve(true)
      } catch (error) {
        reject(error)
      }
    })
  }

  deleteMovementOfArticle = async (movementOfArticleId: string): Promise<void> => {
    return new Promise<void>(async (resolve, reject) => {
      try {
        let result: Responseable
        let movementOfArticle: MovementOfArticle

        result = await this.movementOfArticleController.getAll({
          project: {
            _id: 1,
            article: 1,
            deposit: 1,
            quantityForStock: 1,
            'businessRule._id': 1,
          },
          match: {_id: {$oid: movementOfArticleId}},
        })
        if (result.result.length === 0) {
          throw new Error('No se encuentra el movimiento de producto')
        }
        movementOfArticle = result.result[0]

        let articleStockController: ArticleStockController = new ArticleStockController(
          this.database,
        )

        result = await articleStockController.getAll({
          project: {_id: 1},
          match: {
            article: {$oid: movementOfArticle.article},
            deposit: {$oid: movementOfArticle.deposit},
          },
        })

        if (movementOfArticle.deposit) {
          await articleStockController.updateMany(
            {article: movementOfArticle.article, deposit: movementOfArticle.deposit},
            {$inc: {realStock: -movementOfArticle.quantityForStock}},
          )
        }

        if (movementOfArticle.businessRule) {
          await new BusinessRulesUC(this.database).returnStockById(
            movementOfArticle.businessRule._id,
          )
        }
        await this.movementOfArticleController.delete(movementOfArticle._id)

        resolve()
      } catch (error) {
        reject(error)
      }
    })
  }

  updateByTransactionUC = async (transactionId: string): Promise<boolean> => {
    return new Promise<boolean>(async (resolve, reject) => {
      try {
        let result;
        let movementsOfArticles: MovementOfArticle[]

        // result = await this.movementOfArticleController.getAll({
        //   project: {
		// 	_id: 1, 
		// 	'transaction._id': 1,
		// 	'transaction.type._id': 1,
		// 	'transaction.type.transactionMovement': 1,
		// 	'amount': 1,
		// 	'movementOrigin': 1,
		// 	'movementParent': 1
		// },
        //   match: {
		// 	'transaction._id': {$oid: transactionId},
		//     //'movementOrigin': { $exists: true, $ne: null }
		// },
        // })

		result = await this.movementOfArticleController.getFullQuery([
			{
                "$lookup": {
                    "from": "transactions",
                    "foreignField": "_id",
                    "localField": "transaction",
                    "as": "transaction"
                }
            },
			{
				"$unwind": {
					"path": "$transaction",
					"preserveNullAndEmptyArrays": true
				}
			},	

			{
                "$lookup": {
                    "from": "movements-of-articles",
                    "foreignField": "_id",
                    "localField": "movementOrigin",
                    "as": "movementOrigin"
                }
            },

			{
				"$unwind": {
					"path": "$movementOrigin",
					"preserveNullAndEmptyArrays": true
				}
			},

			{
                "$lookup": {
                    "from": "transactions",
                    "foreignField": "_id",
                    "localField": "movementOrigin.transaction",
                    "as": "movementOrigin.transaction"
                }
            },

			{
				"$unwind": {
					"path": "$movementOrigin.transaction",
					"preserveNullAndEmptyArrays": true
				}
			},
			{
                "$project": {
                    "_id": 1,
					"transaction._id": 1,
					"transaction.type": 1,
					"read": 1,
					"amount" : 1,
					"movementOrigin._id": 1,
					"movementOrigin.read": 1,
					"movementOrigin.transaction._id": 1
				}
			},
			{
				"$match" : {
					'transaction._id': {$oid: transactionId},
					'movementOrigin._id': { $exists: true, $ne: null }
				}
			}
		])

        movementsOfArticles = result.result;
		let transactionOriginId = movementsOfArticles[0].movementOrigin.transaction._id
		//console.log(JSON.stringify(result.result, null, 2));


		console.log(JSON.stringify(movementsOfArticles, null, 2));

		// update mov origin
		for (const mov of movementsOfArticles){

			// actualizamos las lecturas en el origen
			await this.movementOfArticleController.update(mov.movementOrigin._id, {
				read: (mov.movementOrigin.read + 1) * mov.amount
			})
		}

		// verificamos si la transaccion de origen estan todas leidas actualizamos a cerrado el estado
		const movArticleOrigin = await this.movementOfArticleController.getAll({
			project: {
				_id: 1, 
				'transaction._id': 1,
				'amount': 1,
				'read': 1,
				'movementOrigin': 1,
				'movementParent': 1
			},
			match: {
				'transaction._id': {$oid: transactionOriginId},
				// aca nos aseguramos de que sea el leido y no los hijos de la estructura
				$or: [
					{ 'movementParent': { $exists: false } },
					{ 'movementParent': null }
				]
			},
		})

		let isReadComplete: boolean = true;
		movArticleOrigin.result.forEach((mov: MovementOfArticle) => {
			if(mov.read < mov.amount){
				isReadComplete = false
			}
		})

		if(isReadComplete){
			//upadte transaction si todos estan cerrados
			await this.transactionController.update(transactionOriginId, {
				state: TransactionState.Closed
			})
		}
		

        resolve(true)
      } catch (error) {
        reject(error)
      }
    })
  }
}
