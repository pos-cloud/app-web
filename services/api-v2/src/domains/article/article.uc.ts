import * as axios from 'axios'
import Responseable from 'interfaces/responsable.interface'

import {ArticleFieldType} from './../../domains/article-field/article-field.interface'
import FileUC from './../../domains/file/file.uc'
import MovementOfArticleController from './../../domains/movement-of-article/movement-of-article.controller'
import MovementOfArticle from './../../domains/movement-of-article/movement-of-article.interface'
import StructureController from './../../domains/structure/structure.controller'
import Structure from './../../domains/structure/structure.interface'
import {PriceType} from './../../domains/transaction-type/transaction-type.interface'
import MercadoLibreController from './../../domains/uc/mercadolibre.controller'
import WooCommerceController from './../../domains/uc/woocomerce.controller'
import VariantController from './../../domains/variant/variant.controller'
import Variant from './../../domains/variant/variant.interface'
import Responser from './../../utils/responser'
import ArticleController from './article.controller'
import Article from './article.interface'

export default class ArticleUC {
  database: string
  articleController: ArticleController
  api: any
  authToken: string

  constructor(database: string, authToken?: string) {
    this.database = database
    this.authToken = authToken
    this.articleController = new ArticleController(database)
    this.api = axios.default
  }

  updatePurchasePrice = async (transactionId: string): Promise<MovementOfArticle> => {
    return new Promise<MovementOfArticle>(async (resolve, reject) => {
      new MovementOfArticleController(this.database)
        .getAll({
          project: {
            basePrice: 1,
            transaction: 1,
            'article._id': 1,
          },
          match: {
            transaction: {$oid: transactionId},
          },
        })
        .then(async (result: Responseable) => {
          if (result && result.result.length > 0) {
            const movsArticle: MovementOfArticle[] = result.result

            for (const mov of movsArticle) {
              this.articleController.update(mov.article._id, {
                purchasePrice: mov.basePrice,
              })
            }
          }
        })
        .catch((error: Responseable) => reject(error))
    })
  }

  updateCostByStruct = async (): Promise<boolean> => {
    return new Promise<boolean>(async (resolve, reject) => {
      new ArticleController(this.database)
        .getAll({
          project: {
            containsStructure: 1,
            operationType: 1,
          },
          match: {
            operationType: {$ne: 'D'},
            containsStructure: true,
          },
        })
        .then(async (result: Responseable) => {
          if (result && result.result.length > 0) {
            const articles: Article[] = result.result

            for (const article of articles) {
              new StructureController(this.database)
                .getAll({
                  project: {
                    parent: 1,
                    'child.basePrice': 1,
                    operationType: 1,
                  },
                  match: {
                    parent: {$oid: article._id},
                    operationType: {$ne: 'D'},
                  },
                })
                .then(async (result: Responseable) => {
                  if (result && result.result.length > 0) {
                    const structures: Structure[] = result.result
                    let costPrice: Number

                    for (const structure of structures) {
                      costPrice = +structure.child.basePrice
                    }
                    new ArticleController(this.database).update(article._id, {
                      costPrice2: costPrice,
                    })
                  } else {
                    reject(result)
                  }
                })
                .catch((error: Responseable) => reject(error))
            }
          } else {
            reject(result)
          }
        })
        .catch((error: Responseable) => reject(error))
    })
  }

  recalculatePrices = async (
    articlesCode: string[],
    typePrice: PriceType | string,
    decimal: number,
    percentage: number,
  ) => {
    let articlesFails = 0
    let articlesOk = 0

    return new Promise<Responser>(async (resolve) => {
		if(articlesCode && articlesCode.length > 0) {
			for (let i = 0; i < articlesCode.length; i++) {
			  let article: Article = await this.getArticleByCode(articlesCode[i])
	  
			  switch (typePrice) {
				case 'basePrice':
				  article.costPrice = 0
				  article.basePrice = this.roundNumber(
					(article.basePrice * percentage) / 100 + article.basePrice,
					decimal,
				  )
				  let taxedAmount = article.basePrice
	  
				  if (article.otherFields && article.otherFields.length > 0) {
					for (const field of article.otherFields) {
					  if (field.articleField.datatype === ArticleFieldType.Percentage) {
						field.amount = this.roundNumber(
						  (article.basePrice * parseFloat(field.value)) / 100,
						  decimal,
						)
					  } else if (field.articleField.datatype === ArticleFieldType.Number) {
						field.amount = parseFloat(field.value)
					  }
					  if (field.articleField.modifyVAT) {
						taxedAmount += field.amount
					  } else {
						article.costPrice += field.amount
					  }
					}
				  }
	  
				  if (article.taxes && article.taxes.length > 0) {
					for (const articleTax of article.taxes) {
					  articleTax.taxBase = taxedAmount
					  articleTax.taxAmount = this.roundNumber(
						(taxedAmount * articleTax.percentage) / 100,
						decimal,
					  )
					  article.costPrice += articleTax.taxAmount
					}
				  }
				  article.costPrice += taxedAmount
	  
				  if (!(taxedAmount === 0 && article.salePrice !== 0)) {
					article.markupPrice = this.roundNumber(
					  (article.costPrice * article.markupPercentage) / 100,
					  decimal,
					)
					article.salePrice = article.costPrice + article.markupPrice
				  }
				  break
				case 'costPrice':
				  break
				case 'markupPercentage':
				  article.markupPercentage += percentage
				  article.markupPercentage = this.roundNumber(article.markupPercentage, decimal)
				  article.markupPrice = this.roundNumber(
					(article.costPrice * article.markupPercentage) / 100,
				  )
				  article.salePrice = article.costPrice + article.markupPrice
				  break
				case 'salePrice':
				  article.salePrice += this.roundNumber((percentage * article.salePrice) / 100)
				  article.salePrice = this.roundNumber(article.salePrice, decimal)
				  if (article.basePrice === 0) {
					article.costPrice === 0
					article.markupPercentage = 100
					article.markupPrice = article.salePrice
				  } else {
					article.markupPrice = article.salePrice - article.costPrice
					article.markupPercentage = this.roundNumber((article.markupPrice / article.costPrice) * 100, decimal)
				  }
				  break
				default:
				  break
			  }
	  
			  const result = await new ArticleController(this.database).update(
				article._id,
				article,
			  )
	  
			  if (result.status === 200) {
				articlesOk++
			  } else {
				articlesFails++
			  }
			}
		} else {
			const articles: Article[] = await this.getArticles();

			for (const article of articles) {

				switch (typePrice) {
					case 'basePrice':
					  article.costPrice = 0
					  article.basePrice = this.roundNumber(
						(article.basePrice * percentage) / 100 + article.basePrice,
						decimal,
					  )
					  let taxedAmount = article.basePrice
		  
					  if (article.otherFields && article.otherFields.length > 0) {
						for (const field of article.otherFields) {
						  if (field.articleField.datatype === ArticleFieldType.Percentage) {
							field.amount = this.roundNumber(
							  (article.basePrice * parseFloat(field.value)) / 100,
							  decimal,
							)
						  } else if (field.articleField.datatype === ArticleFieldType.Number) {
							field.amount = parseFloat(field.value)
						  }
						  if (field.articleField.modifyVAT) {
							taxedAmount += field.amount
						  } else {
							article.costPrice += field.amount
						  }
						}
					  }
		  
					  if (article.taxes && article.taxes.length > 0) {
						for (const articleTax of article.taxes) {
						  articleTax.taxBase = taxedAmount
						  articleTax.taxAmount = this.roundNumber(
							(taxedAmount * articleTax.percentage) / 100,
							decimal,
						  )
						  article.costPrice += articleTax.taxAmount
						}
					  }
					  article.costPrice += taxedAmount
		  
					  if (!(taxedAmount === 0 && article.salePrice !== 0)) {
						article.markupPrice = this.roundNumber(
						  (article.costPrice * article.markupPercentage) / 100,
						  decimal,
						)
						article.salePrice = article.costPrice + article.markupPrice
					  }
					  break
					case 'costPrice':
					  break
					case 'markupPercentage':
					  article.markupPercentage += percentage
					  article.markupPercentage = this.roundNumber(article.markupPercentage, decimal)
					  article.markupPrice = this.roundNumber(
						(article.costPrice * article.markupPercentage) / 100,
					  )
					  article.salePrice = article.costPrice + article.markupPrice
					  break
					case 'salePrice':
					  article.salePrice += this.roundNumber((percentage * article.salePrice) / 100)
					  article.salePrice = this.roundNumber(article.salePrice, decimal)
					  if (article.basePrice === 0) {
						article.costPrice === 0
						article.markupPercentage = 100
						article.markupPrice = article.salePrice
					  } else {
						article.markupPrice = article.salePrice - article.costPrice
						article.markupPercentage = this.roundNumber(
						  (article.markupPrice / article.costPrice) * 100,
						)
					  }
					  break
					default:
					  break
				  }
		  
				  const result = await new ArticleController(this.database).update(
					article._id,
					article,
				  )
		  
				  if (result.status === 200) {
					articlesOk++
				  } else {
					articlesFails++
				  }
			}


		}

      resolve(new Responser(200, {articlesOk, articlesFails}, null, null))
    })
  }

  getArticleByCode = async (code: string) => {
    return new Promise<Article>(async (resolve) => {
      await new ArticleController(this.database)
        .getAll({
          project: {
            code: 1,
            salePrice: 1,
            costPrice: 1,
            costPrice2: 1,
            basePrice: 1,
            markupPercentage: 1,
            markupPrice: 1,
            taxes: 1,
            operationType: 1,
          },
          match: {
            code: {$regex: code, $options: 'i'},
            operationType: {$ne: 'D'},
          },
        })
        .then((result: Responseable) => {
          if (result.status === 200) resolve(result.result[0])
        })
    })
  }

  getArticles = async () => {
	return new Promise<Article[]>(async (resolve) => {
		await new ArticleController(this.database)
		  .getAll({
			project: {
			  code: 1,
			  salePrice: 1,
			  costPrice: 1,
			  costPrice2: 1,
			  basePrice: 1,
			  markupPercentage: 1,
			  markupPrice: 1,
			  taxes: 1,
			  operationType: 1,
			},
			match: {
			  operationType: {$ne: 'D'},
			},
		  })
		  .then((result: Responseable) => {
			if (result.status === 200) resolve(result.result)
		  })
	  })
  }

  deleteArticle = async (articleId: string) => {
    try {
      const response = await new ArticleController(this.database).getById(articleId)
      const article: Article = response.result

      await this.articleController.delete(articleId)
      await new WooCommerceController(this.database).syncArticles(articleId)
      await new MercadoLibreController(this.database).syncArticles(articleId)
      if (article.picture && article.picture !== 'deafult.jpg') {
        try {
          await new FileUC(this.database, this.authToken).deleteFile('image', 'article', article.picture)
        } catch (error) {
          //ignore error
        }
      }
      article.pictures.forEach((picture) => {
        new FileUC(this.database, this.authToken).deleteFile('image', 'article', picture.picture)
      })

      if (article.containsVariants) {
        const variantsResponse: Responseable = await new VariantController(
          this.database,
        ).getAll({
          project: {articleParent: 1, 'articleChild._id': 1},
          match: {articleParent: {$oid: articleId}},
        })

        const variants: Variant[] = variantsResponse.result

        variants.forEach(async (variant) => {
          await this.deleteArticle(variant.articleChild._id)
        })

        await new VariantController(this.database).deleteMany({
          articleParent: articleId,
        })
      }

      if (article.containsStructure) {
        await new StructureController(this.database).deleteMany({
          parent: articleId,
        })

        await new StructureController(this.database).deleteMany({
          child: articleId,
        })
      }

      return
    } catch (error) {
      throw error
    }
  }


	roundNumber(value: any, numberOfDecimals: number = 2): number {

	if (value !== undefined && !isNaN(value)) {
		const multiplier = Math.pow(10, numberOfDecimals);
		return Math.round(value * multiplier) / multiplier;
	  } else {
		return 0; // Si el valor no es un número válido, devuelve 0
	  }

	}
}
