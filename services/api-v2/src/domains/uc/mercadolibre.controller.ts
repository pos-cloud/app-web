import * as fs from 'fs'

import * as axios from 'axios'
import * as express from 'express'
import * as FormData from 'form-data'
import * as moment from 'moment'

import MovementOfArticle from '../../domains/movement-of-article/movement-of-article.interface'
import MovementOfArticleUC from '../../domains/movement-of-article/movement-of-article.uc'
import MovementOfCashController from '../../domains/movement-of-cash/movement-of-cash.controller'
import MovementOfCash from '../../domains/movement-of-cash/movement-of-cash.interface'
import MovementOfCashSchema from '../../domains/movement-of-cash/movement-of-cash.model'
import PaymentMethodController from '../../domains/payment-method/payment-method.controller'
import PaymentMethod from '../../domains/payment-method/payment-method.interface'
import StructureController from '../../domains/structure/structure.controller'
import Structure, {Utilization} from '../../domains/structure/structure.interface'
import {TransactionType} from '../../domains/transaction-type/transaction-type.interface'
import TransactionUC from '../../domains/transaction/transaction.uc'
import VariantController from '../../domains/variant/variant.controller'
import Variant from '../../domains/variant/variant.interface'
import HttpException from '../../exceptions/HttpException'
import RequestWithUser from '../../interfaces/requestWithUser.interface'
import Responseable from '../../interfaces/responsable.interface'
import authMiddleware from '../../middleware/auth.middleware'
import ensureLic from '../../middleware/license.middleware'
import Responser from '../../utils/responser'
import ApplicationController from '../application/application.controller'
import Application from '../application/application.interface'
import ArticleStockController from '../article-stock/article-stock.controller'
import ArticleController from '../article/article.controller'
import Article from '../article/article.interface'
import CompanyController from '../company/company.controller'
import Company, {CompanyType} from '../company/company.interface'
import CompanySchema from '../company/company.model'
import ConfigController from '../config/config.controller'
import Config from '../config/config.interface'
import IdentificationTypeController from '../identification-type/identification-type.controller'
import IdentificationType from '../identification-type/identification-type.interface'
import ShipmentMethodController from '../shipment-method/shipment-method.controller'
import TransactionTypeController from '../transaction-type/transaction-type.controller'
import TransactionController from '../transaction/transaction.controller'
import Transaction, {TransactionState} from '../transaction/transaction.interface'
import TransactionSchema from '../transaction/transaction.model'
import VATConditionController from '../vat-condition/vat-condition.controller'
import VATCondition from '../vat-condition/vat-condition.interface'

import BranchController from './../../domains/branch/branch.controller'
import Branch from './../../domains/branch/branch.interface'
import CountryController from './../../domains/country/country.controller'
import Country from './../../domains/country/country.interface'
import DepositController from './../../domains/deposit/deposit.controller'
import Deposit from './../../domains/deposit/deposit.interface'
import StateController from './../../domains/state/state.controller'
import State from './../../domains/state/state.interface'
import StateSchema from './../../domains/state/state.model'

export default class MercadoLibreController {
  path = '/meli/'
  router = express.Router()
  MELI_BASE_URL: string = 'https://api.mercadolibre.com'
  api: any
  database: string
  authToken: string
  application: Application
  build: string = 'prod' // prod/test
  clientId: string
  clientSecret: string
  redirectUri: string

  constructor(database: string) {
    this.database = database
    this.api = axios.default
    if (this.build === 'prod') {
      this.clientId = '3033899131061978'
      this.clientSecret = '9dc4O1yjkRFnTBL9FkS11PAJ4j3cUyGV'
      this.redirectUri = 'https://apiv8.poscloud.com.ar/meli/auth'
    } else {
      this.clientId = '3438498871623875'
      this.clientSecret = 'J3BMkGx5AJqcQhRuwTyntzOe6Yfz6nz3'
      this.redirectUri = 'https://asd.asd'
    }
    this.initializeRoutes()
  }

  private initializeRoutes() {
    this.router.get(`${this.path}auth`, this.auth)
    this.router.get(`${this.path}notify`, this.notify)
    this.router.post(
      `${this.path}sync-article/:id`,
      [authMiddleware, ensureLic],
      this.syncArticle,
    )
    this.router.get(
      `${this.path}categories`,
      [authMiddleware, ensureLic],
      this._mGetCategories,
    )
    this.router.get(
      `${this.path}subcategories`,
      [authMiddleware, ensureLic],
      this._mGetSubcategories,
    )
    this.router.get(
      `${this.path}attrs/:categoryId`,
      [authMiddleware, ensureLic],
      this._mGetAttrsByCategory,
    )
    this.router.get(
      `${this.path}sales-term/:categoryId`,
      [authMiddleware, ensureLic],
      this._mGetSalesTermByCategory,
    )
    this.router.post(
      `${this.path}import-transactions`,
      [authMiddleware, ensureLic],
      this.importTransactions,
    )
  }

  private async connect(database: string) {
    return new Promise(async (resolve, reject) => {
      try {
        this.database = database
        await new ApplicationController(this.database)
          .getAll({match: {'integrations.meli.token': {$exists: true}}})
          .then((result: Responseable) => {
            if (result.result.length > 0) this.application = result.result[0]
          })
        resolve(new Responser(200, this.application))
      } catch (error) {
        reject(error)
      }
    })
  }

  private auth = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction,
  ) => {
    try {
      this.authToken = request.headers.authorization
      let code: string = request.query.code as string
      let state: string = request.query.state as string
      let appId: string = state.split('-DB-')[0]

      this.database = state.split('-DB-')[1]
      await this.generateToken(appId, code)
      response.send(new Responser(200, 'Se ha autorizado la conexión con mercado libre.'))
    } catch (error) {
      next(
        new HttpException(new Responser(error.status || 500, null, error.message, error)),
      )
    }
  }

  private async generateToken(appId: string, code: string) {
    return new Promise(async (resolve, reject) => {
      try {
        let response = await this.api.post(
          `${this.MELI_BASE_URL}/oauth/token?grant_type=authorization_code&client_id=${this.clientId}&client_secret=${this.clientSecret}&code=${code}&redirect_uri=${this.redirectUri}`,
        )

        await new ApplicationController(this.database)
          .update(appId, {
            integrations: {
              meli: {
                code: code,
                token: response.data.access_token,
                refreshToken: response.data.refresh_token,
              },
            },
          })
          .then((result: Responseable) => resolve(result))
      } catch (error) {
        reject(error)
      }
    })
  }

  private notify = async (request: express.Request, response: express.Response) => {
    response.send(new Responser(200, 'Finaliza notify'))
  }

  private refreshToken = async () => {
    return new Promise(async (resolve, reject) => {
      try {
        let response = await this.api.post(
          `${this.MELI_BASE_URL}/oauth/token?grant_type=refresh_token&client_id=${this.clientId}&client_secret=${this.clientSecret}&refresh_token=${this.application.integrations.meli.refreshToken}`,
        )

        await new ApplicationController(this.database)
          .update(this.application._id, {
            integrations: {
              meli: {
                token: response.data.access_token,
                refreshToken: response.data.refresh_token,
              },
            },
          })
          .then((result: Responseable) => resolve(result))
      } catch (error) {
        reject(error)
      }
    })
  }

  private syncArticle = async (
    request: RequestWithUser,
    response: express.Response,
    next: express.NextFunction,
  ) => {
    try {
      this.authToken = request.headers.authorization
      const articleId = request.params.id

      await this.connect(request.database)
      if (this.application) await this.syncArticles(articleId)
      response.send(new Responser(200, 'Finaliza sync article'))
    } catch (error) {
      if (error.message === 'Invalid token' || error.message === 'expired_token')
        await this.refreshToken()
          .then(async () => {
            this.syncArticle(request, response, next)
          })
          .catch((error) =>
            next(
              new HttpException(
                new Responser(error.status || 500, null, error.message, error),
              ),
            ),
          )
      else
        next(
          new HttpException(
            new Responser(error.status || 500, null, error.message, error),
          ),
        )
    }
  }

  /* CATEGORIES */
  private _mGetCategories = async (
    request: RequestWithUser,
    response: express.Response,
    next: express.NextFunction,
  ) => {
    try {
      this.authToken = request.headers.authorization
      let categories: any[] = new Array()

      await this.connect(request.database)
      if (this.application)
        await this._mLoadCategories().then(async (result: any[]) => (categories = result))
      response.send(new Responser(200, categories))
    } catch (error) {
      next(
        new HttpException(new Responser(error.status || 500, null, error.message, error)),
      )
    }
  }

  /* SUBCATEGORIES */
  private _mGetSubcategories = async (
    request: RequestWithUser,
    response: express.Response,
    next: express.NextFunction,
  ) => {
    try {
      this.authToken = request.headers.authorization
      let categories: any[] = new Array()
      let id: string = request.query.id as string

      await this.connect(request.database)
      if (!id && this.application)
        throw new HttpException(
          new Responser(
            500,
            null,
            'Debe indicar el id de la categoría',
            'Debe indicar el id de la categoría',
          ),
        )
      if (this.application)
        await this._mLoadSubcategories(id).then(
          async (result: any[]) => (categories = result),
        )
      response.send(new Responser(200, categories))
    } catch (error) {
      next(
        new HttpException(new Responser(error.status || 500, null, error.message, error)),
      )
    }
  }

  async _mLoadCategories() {
    return new Promise(async (resolve, reject) => {
      await this.api
        .get(`${this.MELI_BASE_URL}/sites/MLA/categories`)
        .then((response: any) => resolve(response.data))
        .catch((error: any) =>
          reject(
            new HttpException(
              new Responser(
                500,
                null,
                error.response && error.response.data
                  ? error.response.data.message
                  : error.message,
                error,
              ),
            ),
          ),
        )
    })
  }

  async _mLoadSubcategories(categoryId: string) {
    return new Promise(async (resolve, reject) => {
      await this.api
        .get(`${this.MELI_BASE_URL}/categories/${categoryId}`)
        .then((response: any) => resolve(response.data))
        .catch((error: any) =>
          reject(
            new HttpException(
              new Responser(
                500,
                null,
                error.response && error.response.data
                  ? error.response.data.message
                  : error.message,
                error,
              ),
            ),
          ),
        )
    })
  }
  /* FIN CATEGORIES */

  /* ATTRS */
  private _mGetAttrsByCategory = async (
    request: RequestWithUser,
    response: express.Response,
    next: express.NextFunction,
  ) => {
    try {
      this.authToken = request.headers.authorization
      let attrs: any[] = new Array()
      let categoryId: string = request.params.categoryId

      await this.connect(request.database)
      if (!categoryId && this.application)
        throw new HttpException(
          new Responser(
            500,
            null,
            'Debe indicar el id de la categoría',
            'Debe indicar el id de la categoría',
          ),
        )
      if (this.application)
        await this._mLoadAttrsByCategory(categoryId).then(
          async (result: any[]) => (attrs = result),
        )
      response.send(new Responser(200, attrs))
    } catch (error) {
      next(
        new HttpException(new Responser(error.status || 500, null, error.message, error)),
      )
    }
  }

  async _mLoadAttrsByCategory(categoryId: string) {
    return new Promise(async (resolve, reject) => {
      await this.api
        .get(
          `${this.MELI_BASE_URL}/categories/${categoryId}/attributes?access_token=${this.application.integrations.meli.token}`,
        )
        .then((response: any) => resolve(response.data))
        .catch((error: any) =>
          reject(
            new HttpException(
              new Responser(
                500,
                null,
                error.response && error.response.data
                  ? error.response.data.message
                  : error.message,
                error,
              ),
            ),
          ),
        )
    })
  }
  /* FIN ATTRS */

  /* SALES TERM */
  private _mGetSalesTermByCategory = async (
    request: RequestWithUser,
    response: express.Response,
    next: express.NextFunction,
  ) => {
    try {
      this.authToken = request.headers.authorization
      let attrs: any[] = new Array()
      let categoryId: string = request.params.categoryId

      await this.connect(request.database)
      if (!categoryId && this.application) {
        throw new HttpException(
          new Responser(
            500,
            null,
            'Debe indicar el id de la categoría',
            'Debe indicar el id de la categoría',
          ),
        )
      }
      if (this.application)
        await this._mLoadSalesTermByCategory(categoryId).then(
          async (result: Responseable) => (attrs = result.result),
        )
      response.send(new Responser(200, attrs))
    } catch (error) {
      next(
        new HttpException(new Responser(error.status || 500, null, error.message, error)),
      )
    }
  }

  async _mLoadSalesTermByCategory(categoryId: string) {
    return new Promise(async (resolve, reject) => {
      await this.api
        .get(
          `${this.MELI_BASE_URL}/categories/${categoryId}/sale_terms?access_token=${this.application.integrations.meli.token}`,
        )
        .then((response: any) => resolve(new Responser(200, response.data)))
        .catch((error: any) =>
          reject(
            new HttpException(
              new Responser(
                500,
                null,
                error.response && error.response.data
                  ? error.response.data.message
                  : error.message,
                error,
              ),
            ),
          ),
        )
    })
  }
  /* FIN SALES TERM */

  /* ARTICLES */
  async syncArticles(articleId?: string): Promise<Article[]> {
    return new Promise<Article[]>(async (resolve, reject) => {
      try {
        let _pArticles: Article[] = new Array()

        if (!this.application) await this.connect(this.database)
        if (this.application)
          await this._pLoadArticles(
            articleId ? {_id: {$oid: articleId}, type: 'Final'} : {type: 'Final'},
          ).then(async (result: Article[]) => (_pArticles = result))
        if (this.application && articleId && _pArticles.length === 0) {
          // VERIFICAR SI ES VARIANTE CARGAMOS EL ARTÍCULO PADRE
          if (articleId) {
            await this._pLoadArticleParent(articleId).then(
              async (result: Responseable) => {
                if (result.result) {
                  if (!_pArticles) _pArticles = new Array()
                  _pArticles.push(result.result)
                }
              },
            )
          } else
            throw new HttpException(
              new Responser(
                500,
                null,
                'El artículo no se encuentra para sincronizar.',
                'El artículo no se encuentra para sincronizar.',
              ),
            )
        }

        if (this.application) {
          if (_pArticles && _pArticles.length > 0) {
            for (let _pArticle of _pArticles) {
              let attributes: {
                id: string
                value_name: string
              }[] = new Array()
              let _pArticlesChilds: Article[] = new Array()
              let _pVariants: Variant[] = new Array()
              let _mVariants: any[] = new Array()
              let _mVariantsWithArticleChild: any[] = new Array()
              let stock: number = 0

              if (_pArticle.containsVariants) {
                _pVariants = await this._pLoadVariants(
                  articleId ? {articleParent: {$oid: articleId}} : {},
                )
                if (_pVariants && _pVariants.length > 0) {
                  for (let _pVariant of _pVariants) {
                    let exists: boolean = false

                    for (let _pArticleChild of _pArticlesChilds) {
                      if (
                        _pArticleChild._id.toString() ===
                        _pVariant.articleChild._id.toString()
                      )
                        exists = true
                    }
                    if (!exists) _pArticlesChilds.push(_pVariant.articleChild)
                  }
                }

                if (_pArticlesChilds && _pArticlesChilds.length > 0) {
                  for (let _pArticleChild of _pArticlesChilds) {
                    attributes = new Array()
                    let stockVariant: number = 0

                    if (_pArticleChild.operationType !== 'D') {
                      await new ArticleStockController(this.database)
                        .getAll({
                          project: {article: 1, realStock: 1},
                          match: {article: {$oid: _pArticleChild._id}},
                        })
                        .then((result: Responseable) => {
                          for (let artStock of result.result) {
                            stockVariant += artStock.realStock
                          }
                        })
                      stockVariant =
                        _pArticleChild.meliAttrs.listing_type_id === 'free' &&
                        stockVariant > 0
                          ? 1
                          : stockVariant

                      _pArticle.pictures = await this._mUploadImagesArticle(_pArticle)

                      let images: string[] = new Array()

                      if (_pArticle.pictures && _pArticle.pictures.length > 0) {
                        for (let image of _pArticle.pictures) {
                          images.push(image.meliId)
                        }
                      }

                      for (let _pVariant of _pVariants) {
                        if (
                          _pArticleChild._id.toString() ===
                          _pVariant.articleChild._id.toString()
                        ) {
                          attributes.push({
                            id: _pVariant.type.meliId,
                            value_name: _pVariant.value.description,
                          })
                        }
                      }

                      let _mVariant: any = {
                        attribute_combinations: attributes,
                        price: _pArticleChild.currency
                          ? _pArticleChild.salePrice * _pArticleChild.currency.quotation
                          : _pArticleChild.salePrice,
                        available_quantity: stockVariant,
                        picture_ids: images,
                      }

                      _mVariants.push(_mVariant)
                      _mVariantsWithArticleChild.push({
                        ..._mVariant,
                        articleChildId: _pArticleChild._id,
                      })
                    }
                    stock += stockVariant
                  }
                }
              } else {
                if (_pArticle.operationType !== 'D') {
                  await new ArticleStockController(this.database)
                    .getAll({
                      project: {article: 1, realStock: 1},
                      match: {article: {$oid: _pArticle._id}},
                    })
                    .then((result: Responseable) => {
                      for (let artStock of result.result) {
                        stock += artStock.realStock
                      }
                    })
                  stock =
                    _pArticle.meliAttrs.listing_type_id === 'free' && stock > 0
                      ? 1
                      : stock
                }
              }
              _pArticle.pictures = await this._mUploadImagesArticle(_pArticle)
              await this._pUpdateArticle(_pArticle._id, {pictures: _pArticle.pictures})

              let images: {id: string}[] = new Array()

              if (_pArticle.pictures && _pArticle.pictures.length > 0) {
                for (let image of _pArticle.pictures) {
                  images.push({id: image.meliId})
                }
              }
              let _mArticle: any = {
                title: _pArticle.description,
                status: !_pArticle.ecommerceEnabled || stock === 0 ? 'paused' : 'active',
                price: _pArticle.currency
                  ? _pArticle.salePrice * _pArticle.currency.quotation
                  : _pArticle.salePrice,
                currency_id:
                  _pArticle.currency && _pArticle.currency.code
                    ? _pArticle.currency.code
                    : 'ARS',
                available_quantity: stock,
                pictures: images,
                attributes: _pArticle.meliAttrs.attributes,
                sale_terms: _pArticle.meliAttrs.sale_terms,
                variations: _mVariants,
              }

              if (_pArticle.meliId) {
                if (_pArticle.operationType === 'D') {
                  await this._mDeleteArticle(_pArticle)
                } else {
                  _mArticle = {
                    ..._mArticle,
                  }
                  await this._mUpdateArticle(_pArticle.meliId, _mArticle)
                  await this._pUpdateArticle(_pArticle._id, {url: _mArticle.permalink})
                }
              } else {
                _mArticle = {
                  ..._mArticle,
                  category_id:
                    _pArticle.meliAttrs && _pArticle.meliAttrs.category
                      ? _pArticle.meliAttrs.category.id
                        ? _pArticle.meliAttrs.category.id
                        : _pArticle.meliAttrs.category.category_id
                      : '',
                  description: _pArticle.meliAttrs
                    ? _pArticle.meliAttrs.description.plain_text
                    : '',
                  site_id: 'MLA',
                  listing_type_id: _pArticle.meliAttrs
                    ? _pArticle.meliAttrs.listing_type_id
                    : '',
                  condition: 'new',
                }
                _mArticle = await this._mSaveArticle(_mArticle)
                await this._pUpdateArticle(_pArticle._id, {
                  meliId: _mArticle.id,
                  url: _mArticle.permalink,
                })
                await this.associateVariants(_mArticle, _mVariantsWithArticleChild)
              }
            }
          }
        }

        resolve(_pArticles)
      } catch (error) {
        reject(error)
      }
    })
  }

  async associateVariants(_mArticle: any, _mVariantsWithArticleChild: any) {
    return new Promise(async (resolve, reject) => {
      try {
        let variations: any[] = _mArticle.variations

        if (variations && variations.length > 0) {
          let i: number = 0

          for (let variation of variations) {
            let isEqual: boolean = true

            if (
              variation.attribute_combinations &&
              variation.attribute_combinations.length > 0
            ) {
              let j: number = 0

              for (let attr of variation.attribute_combinations) {
                if (
                  _mVariantsWithArticleChild[i].attribute_combinations[j].id !==
                    attr.id ||
                  _mVariantsWithArticleChild[i].attribute_combinations[j].value_name !==
                    attr.value_name
                ) {
                  isEqual = false
                }
                j++
              }
            }
            if (isEqual) {
              await new ArticleController(this.database).update(
                _mVariantsWithArticleChild[i].articleChildId,
                {meliId: variation.id},
              )
            }
            i++
          }
        }
        resolve(variations)
      } catch (error) {
        reject(error)
      }
    })
  }

  async _pLoadArticles(match: any = {}): Promise<Article[]> {
    return new Promise<Article[]>(async (resolve, reject) => {
      try {
        let articles: Article[] = new Array()

        if (!this.application) await this.connect(this.database)
        if (this.application) {
          if (!match['meliId']) {
            match = {
              ...match,
              $or: [
                {
                  applications: {$oid: this.application._id},
                  operationType: {$ne: 'D'},
                  ecommerceEnabled: true,
                  allowSale: true,
                  forShipping: false,
                },
                {
                  applications: {$oid: this.application._id},
                  meliId: {
                    $exists: true,
                    $ne: null,
                  },
                  operationType: {$ne: 'D'},
                },
              ],
            }
          } else {
            match = {
              ...match,
              operationType: {$ne: 'D'},
              applications: {$oid: this.application._id},
            }
          }
          await new ArticleController(this.database)
            .getAll({
              project: {
                _id: 1,
                type: 1,
                order: 1,
                containsVariants: 1,
                containsStructure: 1,
                code: 1,
                codeSAT: 1,
                description: 1,
                url: 1,
                posDescription: 1,
                quantityPerMeasure: 1,
                unitOfMeasurement: 1,
                observation: 1,
                notes: 1,
                tags: 1,
                basePrice: 1,
                otherFields: 1,
                taxes: 1,
                costPrice: 1,
                markupPercentage: 1,
                markupPrice: 1,
                salePrice: 1,
                'currency.quotation': 1,
                make: 1,
                deposits: 1,
                locations: 1,
                children: 1,
                pictures: 1,
                barcode: 1,
                meliId: 1,
                meliAttrs: 1,
                printIn: 1,
                posKitchen: 1,
                allowPurchase: 1,
                allowSale: 1,
                allowSaleWithoutStock: 1,
                allowMeasure: 1,
                ecommerceEnabled: 1,
                favourite: 1,
                isWeigth: 1,
                forShipping: 1,
                picture: 1,
                providers: 1,
                provider: 1,
                applications: 1,
                classification: 1,
                harticle: 1,
                salesAccount: 1,
                purchaseAccount: 1,
                'category._id': 1,
                'category.meliId': 1,
              },
              match,
            })
            .then((result: Responseable) => (articles = result.result))
        }

        resolve(articles)
      } catch (error) {
        reject(error)
      }
    })
  }

  async _pLoadArticlesByIdML(meliId: string): Promise<Article[]> {
    return new Promise<Article[]>(async (resolve, reject) => {
      try {
        let articles: Article[] = new Array()

        if (!this.application) await this.connect(this.database)
        if (this.application) {
          await new ArticleController(this.database)
            .getAll({
              match: {meliId, operationType: {$ne: 'D'}},
            })
            .then((result: Responseable) => (articles = result.result))
        }

        resolve(articles)
      } catch (error) {
        reject(error)
      }
    })
  }

  async _pLoadArticleParent(articleChildId: string) {
    return new Promise(async (resolve, reject) => {
      try {
        let _pArticle: Article

        if (!this.application) await this.connect(this.database)
        await new VariantController(this.database)
          .getAll({
            project: {
              _id: 1,
              operationType: 1,
              'type.meliId': 1,
              'value.description': 1,
              articleParent: 1,
              articleChild: 1,
            },
            match: {articleChild: {$oid: articleChildId}, operationType: {$ne: 'D'}},
          })
          .then(async (result: Responseable) => {
            if (result.result.length > 0)
              await this._pLoadArticles({
                _id: {$oid: result.result[0].articleParent},
              }).then(async (result: Article[]) => {
                if (result.length > 0) _pArticle = result[0]
              })
          })
        resolve(new Responser(200, _pArticle))
      } catch (error) {
        reject(error)
      }
    })
  }

  async _pLoadVariants(match: any = {}): Promise<Variant[]> {
    return new Promise<Variant[]>(async (resolve, reject) => {
      try {
        let _pVariants: Variant[] = new Array()

        if (!this.application) await this.connect(this.database)
        await new VariantController(this.database)
          .getAll({
            project: {
              _id: 1,
              operationType: 1,
              'type.meliId': 1,
              'value.description': 1,
              articleParent: 1,
              articleChild: 1,
            },
            match: {...match, operationType: {$ne: 'D'}},
          })
          .then(async (result: Responseable) => {
            if (result.result.length > 0) {
              _pVariants = result.result
              for (let _pVariant of _pVariants) {
                await this._pLoadArticles({_id: {$oid: _pVariant.articleChild}}).then(
                  async (result: Article[]) => {
                    if (result && result.length > 0) _pVariant.articleChild = result[0]
                  },
                )
              }
            }
          })
        resolve(_pVariants)
      } catch (error) {
        reject(error)
      }
    })
  }

  async _pUpdateArticle(_id: string, params: any) {
    return new Promise(async (resolve, reject) => {
      try {
        if (!this.application) await this.connect(this.database)
        await new ArticleController(this.database)
          .update(_id, params)
          .then((result: Responseable) => resolve(result))
      } catch (error) {
        reject(error)
      }
    })
  }

  async _mSaveArticle(_mArticle: any): Promise<any> {
    return new Promise<any>(async (resolve, reject) => {
      try {
        if (!this.application) await this.connect(this.database)
        try {
          let description = _mArticle.description

          delete _mArticle.description
          await this.api
            .post(
              `${this.MELI_BASE_URL}/items?access_token=${this.application.integrations.meli.token}`,
              _mArticle,
            )
            .then(async (response: any) => (_mArticle = response.data))
          await this.api.post(
            `${this.MELI_BASE_URL}/items/${_mArticle.id}/description?access_token=${this.application.integrations.meli.token}`,
            {plain_text: description},
          )
        } catch (error) {
          let message: string = 'Error inesperado'

          if (error.response && error.response.data && error.response.data.cause) {
            message = ``
            if (error.response.data.cause.length > 0) {
              for (let cause of error.response.data.cause) {
                message += `${cause.type ? cause.type.toUpperCase() : cause.type} NRO ${
                  cause.cause_id
                } - ${cause.message}. `
              }
            } else {
              message = error.response.data.message
            }
          }
          throw new HttpException(new Responser(500, null, message, error))
        }
        resolve(_mArticle)
      } catch (error) {
        reject(error)
      }
    })
  }

  async _mUpdateArticle(id: string, _mArticle: any): Promise<any> {
    return new Promise<any>(async (resolve, reject) => {
      try {
        if (!this.application) await this.connect(this.database)
        await this.api
          .put(
            `${this.MELI_BASE_URL}/items/${id}?access_token=${this.application.integrations.meli.token}`,
            _mArticle,
          )
          .then(async (response: any) => (_mArticle = response.data))
          .catch((error: any) => {
            let message: string =
              error.response.data.message !== 'Oops! Something went wrong...'
                ? error.response.data.message
                : error.response.data.error

            if (error.response.data.cause && error.response.data.cause.length > 0) {
              message = ``
              for (let cause of error.response.data.cause) {
                message += `${cause.type ? cause.type.toUpperCase() : cause.type} NRO ${
                  cause.cause_id
                } - ${cause.message}. `
              }
            }
            throw new HttpException(new Responser(500, null, message, error))
          })
        resolve(_mArticle)
      } catch (error) {
        reject(error)
      }
    })
  }

  async _mUploadImagesArticle(article: Article): Promise<any[]> {
    return new Promise<any[]>(async (resolve, reject) => {
      try {
        if (!this.application) await this.connect(this.database)
        if (this.application)
          for (let image of article.pictures) {
            if (!image.meliId)
              image.meliId = await this._mUploadImageArticle(image.picture)
          }
        resolve(article.pictures)
      } catch (error) {
        reject(error)
      }
    })
  }

  async _mUploadImageArticle(picture: string): Promise<string> {
    return new Promise<string>(async (resolve, reject) => {
      setTimeout(async () => {
        try {
          let id: string

          if (!this.application) await this.connect(this.database)
          let formData = new FormData()
          let rootFile = `/home/clients/${this.database}/images/article/${picture}`

          formData.append('file', fs.createReadStream(rootFile))
          await this.api
            .post(
              `${this.MELI_BASE_URL}/pictures/items/upload?access_token=${this.application.integrations.meli.token}`,
              formData,
              {headers: formData.getHeaders()},
            )
            .then((response: any) => (id = response.data.id))
          resolve(id)
        } catch (error) {
          reject(error)
        }
      }, 1000)
    })
  }

  async _mDeleteArticle(article: Article) {
    return new Promise(async (resolve, reject) => {
      try {
        if (!this.application) await this.connect(this.database)
        await this.api
          .delete(`products/${article.meliId}?force=true`)
          .then((response: any) => resolve(new Responser(200, response.data)))
      } catch (error) {
        reject(error)
      }
    })
  }

  async getStockByArticle(article: Article) {
    return new Promise(async (resolve, reject) => {
      await new ArticleStockController(this.database)
        .getAll({
          project: {article: 1, realStock: 1, operationType: 1},
          match: {article: {$oid: article._id}, operationType: {$ne: 'D'}},
        })
        .then((result: Responseable) => {
          if (result.status === 200) {
            if (result.result && result.result.length > 0) {
              resolve(new Responser(200, result.result[0].realStock))
            } else resolve(new Responser(200, 0))
          } else {
            reject(result)
          }
        })
        .catch((error: any) => {
          reject(new HttpException(new Responser(500, null, error.message, error)))
        })
    })
  }
  /* FIN ARTICLES */

  roundNumber(value: any, numberOfDecimals: number = 2): any {
    if (value) {
      if (!isNaN(value)) {
        switch (numberOfDecimals) {
          case 0:
            return Math.round(value * 1) / 1
          case 1:
            return Math.round(value * 10) / 10
          case 2:
            return Math.round(value * 100) / 100
          case 3:
            return Math.round(value * 1000) / 1000
          case 4:
            return Math.round(value * 10000) / 10000
          case 5:
            return Math.round(value * 100000) / 100000
          case 6:
            return Math.round(value * 1000000) / 1000000
          default:
            return Math.round(value * 100) / 100
        }
      } else {
        return parseFloat(value.toFixed(numberOfDecimals))
      }
    } else {
      if (value === 0) {
        return 0
      }
    }
  }

  async _pTransactionLastNumber(
    type: TransactionType,
    origin: number,
    letter: string,
  ): Promise<number> {
    return new Promise<number>(async (resolve, reject) => {
      try {
        if (!this.application) await this.connect(this.database)
        let number: number = 0

        await new TransactionController(this.database)
          .getAll({
            project: {_id: 1, type: 1, origin: 1, letter: 1, number: 1, operationtype: 1},
            match: {type: {$oid: type._id}, origin, letter, operationType: {$ne: 'D'}},
            sort: {number: -1},
          })
          .then((result: Responseable) => {
            result.result.length > 0 ? (number = result.result[0].number) : 0
          })
        resolve(number)
      } catch (error) {
        reject(error)
      }
    })
  }
  /* FIN TRANSACTIONS */

  /* TRANSACTIONS TYPES */
  async _pLoadTransactionType(): Promise<TransactionType> {
    return new Promise<TransactionType>(async (resolve, reject) => {
      try {
        if (!this.application) await this.connect(this.database)
        let _pTransactionType: TransactionType

        await new TransactionTypeController(this.database)
          .getAll({
            project: {
              _id: 1,
              application: 1,
              meliId: 1,
              operationType: 1,
              modifyStock: 1,
              stockMovement: 1,
              transactionMovement: 1,
              requestTaxes: 1,
              fixedOrigin: 1,
              fixedLetter: 1,
            },
            match: {application: {$oid: this.application._id}, operationType: {$ne: 'D'}},
          })
          .then((result: Responseable) => {
            if (result.result.length > 0) _pTransactionType = result.result[0]
          })
        resolve(_pTransactionType)
      } catch (error) {
        reject(error)
      }
    })
  }
  /* FIN TRANSACTION TYPES */

  /* PAYMENT METHOD */
  async loadPaymentMethod(): Promise<PaymentMethod> {
    return new Promise<PaymentMethod>(async (resolve, reject) => {
      try {
        await new PaymentMethodController(this.database)
          .getAll({
            project: {_id: 1, applications: 1, operationType: 1, isCurrentAccount: 1},
            match: {
              applications: {$oid: this.application._id},
              operationType: {$ne: 'D'},
            },
          })
          .then((result: Responseable) => {
            if (result.result.length === 0)
              throw new HttpException(
                new Responser(
                  400,
                  null,
                  `Debe configurar el método de pago para ${this.application.name}`,
                  `Debe configurar el método de pago para ${this.application.name}`,
                ),
              )
            resolve(result.result[0])
          })
      } catch (error) {
        reject(error)
      }
    })
  }
  /* PAYMENT METHOD */

  /* COMPANY */
  async loadCompany(orderId: string, buyer: any): Promise<Company> {
    return new Promise<Company>(async (resolve, reject) => {
      try {
        let _mCompany = await this._mLoadCompany(orderId)
        let _pCompany: Company = await this._pLoadCompany(
          buyer.id,
          _mCompany.billing_info.doc_number,
        )

        if (!_pCompany) {
          let vatCondition: VATCondition = await this.loadVATCondition({
            description: 'Consumidor Final',
          })

          _pCompany = {
            _id: null,
            type: CompanyType.CLIENT,
            name: buyer.nickname,
            identificationType: await this.loadIdentificationType(
              _mCompany.billing_info.doc_type,
            ),
            identificationValue: _mCompany.billing_info.doc_number,
      //      entryDate: moment().format('YYYY-MM-DDTHH:mm:ssZ'),
            vatCondition,
            audits: [{user: null, date: moment().format('YYYY-MM-DDTHH:mm:ssZ')}],
            meliId: buyer.id,
            country: await this.loadCountryArgentina(),
            observation: buyer.nickname,
          }
          for (let info of _mCompany.billing_info.additional_info) {
            if (info.type === 'TAXPAYER_TYPE_ID')
              _pCompany.vatCondition = await this.loadVATCondition({
                description:
                  info.value.replace('IVA ', '') === 'Monotributo'
                    ? 'Monotributista'
                    : info.value.replace('IVA ', ''),
              })
            if (info.type === 'FIRST_NAME') _pCompany.name = info.value
            if (info.type === 'LAST_NAME') _pCompany.name += ' ' + info.value
            if (info.type === 'CITY_NAME') _pCompany.city = info.value
            if (info.type === 'COMMENT') _pCompany.observation = info.value
            if (info.type === 'STREET_NAME') _pCompany.address = info.value
            if (info.type === 'STREET_NUMBER') _pCompany.addressNumber = info.value
            if (info.type === 'BUSINESS_NAME') _pCompany.name = info.value
            if (info.type === 'STATE_NAME')
              _pCompany.state = await this.loadState(info.value, _pCompany.country)
          }
          _pCompany = Object.assign(CompanySchema.getInstance(this.database), _pCompany)
          await new CompanyController(this.database)
            .save(_pCompany)
            .then((result: Responseable) => (_pCompany = result.result))
        }
        resolve(_pCompany)
      } catch (error) {
        reject(error)
      }
    })
  }

  async loadState(stateName: string, country: Country): Promise<State> {
    return new Promise<State>(async (resolve, reject) => {
      await new StateController(this.database)
        .getAll({match: {name: stateName, operationType: {$ne: 'D'}}})
        .then(async (result: Responseable) => {
          if (result.result.length > 0) {
            resolve(result.result[0])
          } else {
            let state: State = {
              _id: null,
              code: 1,
              name: stateName,
              country,
              audits: [{user: null, date: moment().format('YYYY-MM-DDTHH:mm:ssZ')}],
            }

            state = Object.assign(StateSchema.getInstance(this.database), state)
            await new StateController(this.database)
              .save(state)
              .then((result: Responseable) => resolve(result.result))
              .catch((error) => {
                reject(error)
              })
          }
        })
        .catch((error) => {
          reject(error)
        })
    })
  }

  async loadIdentificationType(name: string): Promise<IdentificationType> {
    return new Promise<IdentificationType>(async (resolve, reject) => {
      await new IdentificationTypeController(this.database)
        .getAll({match: {name, operationType: {$ne: 'D'}}})
        .then((result: Responseable) => {
          resolve(result.result.length > 0 ? result.result[0] : null)
        })
        .catch((error) => {
          reject(error)
        })
    })
  }

  async loadCountryArgentina(): Promise<Country> {
    return new Promise<Country>(async (resolve, reject) => {
      await new CountryController(this.database)
        .getAll({match: {name: 'Argentina', operationType: {$ne: 'D'}}})
        .then((result: Responseable) => {
          resolve(result.result.length > 0 ? result.result[0] : null)
        })
        .catch((error) => {
          reject(error)
        })
    })
  }

  async loadVATCondition(match: {} = {}): Promise<VATCondition> {
    return new Promise<VATCondition>(async (resolve, reject) => {
      await new VATConditionController(this.database)
        .getAll({
          project: {_id: 1, transactionLetter: 1, description: 1, operationType: 1},
          match: {...match, operationType: {$ne: 'D'}},
        })
        .then((result: Responseable) =>
          resolve(result.result.length > 0 ? result.result[0] : null),
        )
        .catch((error) => {
          reject(error)
        })
    })
  }

  async _mLoadCompany(orderId: string): Promise<any> {
    return new Promise<any>(async (resolve, reject) => {
      try {
        if (!this.application) await this.connect(this.database)
        await this.api
          .get(
            `${this.MELI_BASE_URL}/orders/${orderId}/billing_info?access_token=${this.application.integrations.meli.token}`,
          )
          .then((response: any) => resolve(response.data))
          .catch((error: any) => {
            let message: string =
              error.response.data.message !== 'Oops! Something went wrong...'
                ? error.response.data.message
                : error.response.data.error

            if (error.response.data.cause && error.response.data.cause.length > 0) {
              message = ``
              for (let cause of error.response.data.cause) {
                message += `${cause.type ? cause.type.toUpperCase() : cause.type} NRO ${
                  cause.cause_id
                } - ${cause.message}. `
              }
            }
            throw new HttpException(new Responser(500, null, message, error))
          })
      } catch (error) {
        reject(error)
      }
    })
  }

  async _pLoadCompany(meliId: string, docNumber: string): Promise<Company> {
    return new Promise<Company>(async (resolve, reject) => {
      try {
        let cuit: string =
          docNumber.length > 8
            ? `${docNumber.slice(0, 2)}-${docNumber.slice(2, 8)}-${docNumber.slice(
                8,
                10,
              )}`
            : docNumber

        await new CompanyController(this.database)
          .getAll({
            project: {
              _id: 1,
              name: 1,
              emails: 1,
              meliId: 1,
              operationType: 1,
              identificationValue: 1,
              'vatCondition._id': 1,
              'vatCondition.transactionLetter': 1,
            },
            match: {
              $or: [
                {
                  meliId: meliId,
                },
                {
                  identificationValue: {
                    $in: [docNumber, cuit],
                  },
                },
              ],
              operationType: {
                $ne: 'D',
              },
            },
          })
          .then((result: Responseable) => {
            result.result.length > 0 ? resolve(result.result[0]) : resolve(null)
          })
      } catch (error) {
        reject(error)
      }
    })
  }
  /* FIN COMPANIES */

  /* VAT CONDITIONS */
  async _pLoadVatConditions(match: {} = {}) {
    return new Promise(async (resolve, reject) => {
      match = {
        ...match,
        $or: [
          {
            operationType: {$ne: 'D'},
          },
        ],
      }
      await new VATConditionController(this.database)
        .getAll({
          project: {
            _id: 1,
            description: 1,
            operationType: 1,
          },
          match,
        })
        .then((result: Responseable) => {
          if (result.status === 200) {
            resolve(new Responser(200, result.result))
          } else reject(result)
        })
        .catch((error: any) =>
          reject(new HttpException(new Responser(500, null, error.message, error))),
        )
    })
  }
  /* FIN VAT CONDITIONS */

  /* SHIPMENT METHODS */
  async _pLoadShipmentMethods(match: {} = {}) {
    return new Promise(async (resolve, reject) => {
      match = {
        ...match,
        $or: [
          {
            'applications._id': {$oid: this.application._id},
            operationType: {$ne: 'D'},
          },
          {
            meliId: {$exists: true, $ne: '0'},
            operationType: {$ne: 'D'},
          },
        ],
      }
      await new ShipmentMethodController(this.database)
        .getAll({
          project: {
            _id: 1,
            name: 1,
            meliId: 1,
            operationType: 1,
            'applications._id': 1,
          },
          match,
        })
        .then((result: Responseable) => {
          if (result.status === 200) {
            resolve(new Responser(200, result.result))
          } else reject(result)
        })
        .catch((error: any) =>
          reject(new HttpException(new Responser(500, null, error.message, error))),
        )
    })
  }
  /* FIN SHIPMENT METHODS */

  /* CONFIG */
  async _pLoadConfig(): Promise<Config> {
    return new Promise<Config>(async (resolve, reject) => {
      await new ConfigController(this.database)
        .getAll({
          project: {_id: 1, companyVatCondition: 1, operationType: 1},
          match: {operationType: {$ne: 'D'}},
        })
        .then((result: Responseable) =>
          resolve(result.result.length > 0 ? result.result[0] : null),
        )
        .catch((error: any) => reject(error))
    })
  }
  /* FIN CONFIG */

  /* IMPORT TRANSACTIONS */
  private importTransactions = async (
    request: RequestWithUser,
    response: express.Response,
    next: express.NextFunction,
  ) => {
    try {
      this.authToken = request.headers.authorization

      await this.connect(request.database)
      if (this.application) await this.syncTransactions()
      response.send(new Responser(200, 'Finaliza sync transactions'))
    } catch (error) {
      if (error.message === 'Invalid token' || error.message === 'expired_token')
        await this.refreshToken()
          .then(async () => this.importTransactions(request, response, next))
          .catch((error) =>
            next(
              new HttpException(
                new Responser(error.status || 500, null, error.message, error),
              ),
            ),
          )
      else
        next(
          new HttpException(
            new Responser(error.status || 500, null, error.message, error),
          ),
        )
    }
  }

  async syncTransactions() {
    return new Promise(async (resolve, reject) => {
      try {
        let _mTransactions: any[] = new Array()
        let transactionController = new TransactionController(this.database)

        if (!this.application) await this.connect(this.database)

        if (this.application) {
          let result: any = await this._mLoadTransactions()

          _mTransactions = result.results
          if (_mTransactions && _mTransactions.length > 0) {
            let _pTransactionType = await this._pLoadTransactionType()
            let _pConfig: Config = await this._pLoadConfig()

            _pConfig.companyVatCondition = await this.loadVATCondition({
              _id: {$oid: _pConfig.companyVatCondition},
            })
            let branchOrigin: Branch
            let branchDestination: Branch

            await new BranchController(this.database)
              .getAll({
                project: {_id: 1, name: 1, operationType: 1, default: 1},
                match: {default: true, operationType: {$ne: 'D'}},
              })
              .then((result: Responseable) => {
                if (result.result.length === 0)
                  throw new HttpException(
                    new Responser(
                      400,
                      null,
                      'Debe cargar la sucursal por defecto',
                      'Debe cargar la sucursal por defecto',
                    ),
                  )
                branchOrigin = result.result[0]
                branchDestination = result.result[0]
              })
            let depositDestination: Deposit

            await new DepositController(this.database)
              .getAll({
                project: {_id: 1, name: 1, operationType: 1, branch: 1, default: 1},
                match: {
                  branch: {$oid: branchOrigin._id},
                  operationType: {$ne: 'D'},
                  default: true,
                },
              })
              .then((result: Responseable) => {
                if (result.result.length === 0)
                  throw new HttpException(
                    new Responser(
                      400,
                      null,
                      'Debe cargar el depósito para la sucursal ' + branchOrigin.name,
                      'Debe cargar el depósito para la sucursal ' + branchOrigin.name,
                    ),
                  )
                depositDestination = result.result[0]
              })
            let branchFull: Branch

            await new BranchController(this.database)
              .getAll({
                project: {_id: 1, name: 1, operationType: 1, default: 1},
                match: {name: 'Mercado Libre', operationType: {$ne: 'D'}},
              })
              .then((result: Responseable) => {
                if (result.result.length === 0)
                  throw new HttpException(
                    new Responser(
                      400,
                      null,
                      'Debe cargar la sucursal Mercado Libre',
                      'Debe cargar la sucursal Mercado Libre',
                    ),
                  )
                branchFull = result.result[0]
              })
            let depositFull: Deposit

            await new DepositController(this.database)
              .getAll({
                project: {_id: 1, name: 1, operationType: 1},
                match: {name: 'Mercado Libre', operationType: {$ne: 'D'}},
              })
              .then((result: Responseable) => {
                if (result.result.length === 0)
                  throw new HttpException(
                    new Responser(
                      400,
                      null,
                      'Debe cargar el depósito full Mercado Libre',
                      'Debe cargar el depósito full Mercado Libre',
                    ),
                  )
                depositFull = result.result[0]
              })
            for (let _mTransaction of _mTransactions) {
              let exists: boolean = false

              await transactionController
                .getAll({
                  match: {meliId: `${_mTransaction.id}`, operationType: {$ne: 'D'}},
                })
                .then((result: Responseable) => {
                  if (result.result.length > 0) exists = true
                })
              if (!exists) {
                let company: Company =
                  _mTransaction.buyer && _mTransaction.buyer.id
                    ? await this.loadCompany(_mTransaction.id, _mTransaction.buyer)
                    : null
                let origin: number = _pTransactionType.fixedOrigin
                  ? _pTransactionType.fixedOrigin
                  : 0
                let letter: string = _pTransactionType.fixedLetter
                  ? _pTransactionType.fixedLetter
                  : 'X'

                if (company) {
                  company.vatCondition =
                    company.vatCondition && !company.vatCondition._id
                      ? await this.loadVATCondition({
                          _id: {$oid: company.vatCondition.toString()},
                        })
                      : null
                  if (
                    _pConfig.companyVatCondition &&
                    _pConfig.companyVatCondition.description === 'Responsable Inscripto'
                  ) {
                    if (
                      company &&
                      company.vatCondition &&
                      company.vatCondition.transactionLetter
                    ) {
                      letter = company.vatCondition.transactionLetter
                    } else letter = 'B'
                  } else if (
                    _pConfig.companyVatCondition &&
                    _pConfig.companyVatCondition.description === 'Monotributista'
                  ) {
                    letter = 'C'
                  }
                }
                let number =
                  (await this._pTransactionLastNumber(
                    _pTransactionType,
                    origin,
                    letter,
                  )) + 1
                let _pTransaction: Transaction = TransactionSchema.getInstance(
                  this.database,
                )
                let isFull: boolean =
                  _mTransaction.shipping && _mTransaction.shipping.id
                    ? await this.isFullDelivery(_mTransaction.shipping.id)
                    : false

                _pTransaction = Object.assign(_pTransaction, {
                  origin,
                  letter,
                  number,
                  meliId: _mTransaction.id,
                  basePrice: 0,
                  exempt: 0,
                  balance: _mTransaction.total_amount,
                  totalPrice: _mTransaction.total_amount,
                  state: TransactionState.Delivered,
                  type: _pTransactionType,
                  date: _mTransaction.date_closed,
                  endDate: _mTransaction.date_closed,
                  startDate: _mTransaction.date_created,
                  expirationDate: _mTransaction.date_closed,
                  VATPeriod: moment(_mTransaction.date_closed).format('YYYYMM'),
                  madein: 'mercadolibre',
                  quotation: 1,
                  operationType: 'C',
                  audits: [{user: null, date: moment().format('YYYY-MM-DDTHH:mm:ssZ')}],
                  company,
                  branchOrigin: isFull ? branchFull : branchOrigin,
                  branchDestination: isFull ? branchFull : branchDestination,
                  depositOrigin: isFull ? depositFull : depositDestination,
                  depositDestination: isFull ? depositFull : depositDestination,
                })
                _pTransaction = await new TransactionUC(
                  this.database,
                  this.authToken,
                ).saveTransaction(_pTransaction)
                try {
                  for (let order_item of _mTransaction.order_items) {
                    let articles: Article[] = await this._pLoadArticlesByIdML(
                      order_item.item.variation_id
                        ? order_item.item.variation_id.toString()
                        : order_item.item.id,
                    )

                    if (articles.length === 0) {
                      if (order_item.item.variation_id) {
                        throw new HttpException(
                          new Responser(
                            404,
                            null,
                            `La variante ${order_item.item.variation_id} con SKU ${order_item.item.seller_sku} del producto ${order_item.item.id} - ${order_item.item.title} no se encuentra asociado.`,
                            `La variante ${order_item.item.variation_id} con SKU ${order_item.item.seller_sku} del producto ${order_item.item.id} - ${order_item.item.title} no se encuentra asociado.`,
                          ),
                        )
                      } else {
                        throw new HttpException(
                          new Responser(
                            404,
                            null,
                            `El producto ${order_item.item.id} - ${order_item.item.title} no se encuentra asociado.`,
                            `El producto ${order_item.item.id} - ${order_item.item.title} no se encuentra asociado.`,
                          ),
                        )
                      }
                    }
                    let movementOfArticle: MovementOfArticle =
                      await new MovementOfArticleUC(
                        this.database,
                      ).createMovementOfArticle(
                        _pTransaction._id,
                        articles[0]._id,
                        order_item.quantity,
                        order_item.unit_price,
                        true,
                        _pTransaction.depositDestination,
                      )

                    if (articles[0].containsStructure) {
                      let structures: Structure[] = await this.loadStructure(
                        articles[0]._id,
                      )

                      structures.forEach(async (structure: Structure) => {
                        await new MovementOfArticleUC(
                          this.database,
                        ).createMovementOfArticle(
                          _pTransaction._id,
                          structure.child._id,
                          structure.quantity * order_item.quantity,
                          structure.increasePrice ? structure.increasePrice : 0,
                          false,
                          _pTransaction.depositDestination,
                          movementOfArticle,
                        )
                      })
                    }
                  }
                  _pTransaction.taxes = await new TransactionUC(
                    this.database,
                  ).recalculateTaxes(_pTransaction)
                  let movementOfCash: MovementOfCash = MovementOfCashSchema.getInstance(
                    this.database,
                  )
                  let paymentMethod: PaymentMethod = await this.loadPaymentMethod()

                  movementOfCash = Object.assign(movementOfCash, {
                    date: _pTransaction.endDate,
                    expirationDate: _pTransaction.endDate,
                    type: paymentMethod,
                    amountPaid: _pTransaction.totalPrice,
                    audits: [{user: null, date: moment().format('YYYY-MM-DDTHH:mm:ssZ')}],
                    transaction: _pTransaction,
                  })
                  movementOfCash = await new MovementOfCashController(
                    this.database,
                  ).saveMovementOfCash(movementOfCash)
                  if (!paymentMethod.isCurrentAccount)
                    await transactionController.update(_pTransaction._id, {balance: 0})
                } catch (error) {
                  await new TransactionUC(this.database).deleteTransaction(
                    _pTransaction._id,
                  )
                  throw error
                }
              }
            }
          }
        }
        resolve(new Responser(200, _mTransactions))
      } catch (error) {
        reject(error)
      }
    })
  }

  async loadStructure(articleId: string): Promise<Structure[]> {
    return new Promise<Structure[]>(async (resolve, reject) => {
      try {
        let structures: Structure[] = new Array()

        await new StructureController(this.database)
          .getAll({
            project: {
              operationType: 1,
              'parent._id': 1,
              'child._id': 1,
              'child.operationType': 1,
              utilization: 1,
              quantity: 1,
              increasePrice: 1,
            },
            match: {
              operationType: {$ne: 'D'},
              'parent._id': {$oid: articleId},
              'child.operationType': {$ne: 'D'},
              utilization: Utilization.Sale,
            },
          })
          .then((result: Responseable) => (structures = result.result))
        resolve(structures)
      } catch (error) {
        reject(error)
      }
    })
  }

  _mLoadTransactions(): Promise<any[]> {
    return new Promise<any[]>(async (resolve, reject) => {
      try {
        let lastTransactionDate: string

        await new TransactionController(this.database)
          .getAll({match: {operationType: {$ne: 'D'}}, sort: {meliId: -1}})
          .then((result: Responseable) => {
            if (result.result.length > 0) lastTransactionDate = result.result[0].endDate
          })
        let filters: string = `?access_token=${this.application.integrations.meli.token}`

        if (this.database === 'agromade') {
          //https://api.mercadolibre.com/sites/MLA/search?nickname=GUSTAVO
          filters += `&seller=211723653&order.status=paid`
          if (lastTransactionDate) {
            filters += `&order.date_created.from=${moment(lastTransactionDate).format(
              'YYYY-MM-DDTHH:mm:ss',
            )}-00:00`
          } else {
            filters += `&order.date_created.from=2021-08-23T13:49:00-03:00`
          }
        }
        await this.api
          .get(`${this.MELI_BASE_URL}/orders/search${filters}`)
          .then((response: any) => {
            resolve(response && response.data ? response.data : {results: []})
          })
          .catch((error: any) => {
            let message: string =
              error.response.data.message !== 'Oops! Something went wrong...'
                ? error.response.data.message
                : error.response.data.error

            if (error.response.data.cause && error.response.data.cause.length > 0) {
              message = ``
              for (let cause of error.response.data.cause) {
                message += `${cause.type ? cause.type.toUpperCase() : cause.type} NRO ${
                  cause.cause_id
                } - ${cause.message}. `
              }
            }
            throw new HttpException(new Responser(500, null, message, error))
          })
      } catch (error) {
        reject(error)
      }
    })
  }
  /* FIN IMPORT TRANSACTIONS */
  isFullDelivery(shipmentId: string): Promise<boolean> {
    return new Promise<boolean>(async (resolve, reject) => {
      try {
        await this.api
          .get(
            `${this.MELI_BASE_URL}/shipments/${shipmentId}?access_token=${this.application.integrations.meli.token}`,
          )
          .then((response: any) => {
            resolve(
              response && response.data && response.data.logistic_type == 'fulfillment',
            )
          })
          .catch((error: any) => {
            let message: string =
              error.response.data.message !== 'Oops! Something went wrong...'
                ? error.response.data.message
                : error.response.data.error

            if (error.response.data.cause && error.response.data.cause.length > 0) {
              message = ``
              for (let cause of error.response.data.cause) {
                message += `${cause.type ? cause.type.toUpperCase() : cause.type} NRO ${
                  cause.cause_id
                } - ${cause.message}. `
              }
            }
            throw new HttpException(new Responser(500, null, message, error))
          })
      } catch (error) {
        reject(error)
      }
    })
  }
}
