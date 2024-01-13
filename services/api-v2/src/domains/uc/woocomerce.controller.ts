import * as woo from '@woocommerce/woocommerce-rest-api'
import VariantValue from 'domains/variant-value/variant-value.interface'
import * as express from 'express'
import * as moment from 'moment'

import HttpException from '../../exceptions/HttpException'
import RequestWithUser from '../../interfaces/requestWithUser.interface'
import Responseable from '../../interfaces/responsable.interface'
import authMiddleware from '../../middleware/auth.middleware'
import ensureLic from '../../middleware/license.middleware'
import config from '../../utils/config'
import Responser from '../../utils/responser'
import AddressController from '../address/address.controller'
import Address from '../address/address.interface'
import AddressSchema from '../address/address.model'
import ApplicationController from '../application/application.controller'
import Application, {ApplicationType} from '../application/application.interface'
import {ArticleField, ArticleFieldType} from '../article-field/article-field.interface'
import ArticleStockController from '../article-stock/article-stock.controller'
import ArticleController from '../article/article.controller'
import Article from '../article/article.interface'
import ArticleSchema from '../article/article.model'
import CategoryController from '../category/category.controller'
import Category from '../category/category.interface'
import CategorySchema from '../category/category.model'
import CompanyController from '../company/company.controller'
import Company, {CompanyType} from '../company/company.interface'
import CompanySchema from '../company/company.model'
import MovementOfArticle from '../movement-of-article/movement-of-article.interface'
import ShipmentMethodController from '../shipment-method/shipment-method.controller'
import {ShipmentMethod} from '../shipment-method/shipment-method.interface'
import ShipmentMethodSchema from '../shipment-method/shipment-method.model'
import {TransactionType} from '../transaction-type/transaction-type.interface'
import TransactionController from '../transaction/transaction.controller'
import Transaction, {TransactionState} from '../transaction/transaction.interface'
import TransactionSchema from '../transaction/transaction.model'

import VATCondition from './../../domains/vat-condition/vat-condition.interface'
import Branch from './..//branch/branch.interface'
import ArticleFieldController from './../article-field/article-field.controller'
import BranchController from './../branch/branch.controller'
import DepositController from './../deposit/deposit.controller'
import Deposit from './../deposit/deposit.interface'
import MovementOfArticleUC from './../movement-of-article/movement-of-article.uc'
import MovementOfCashController from './../movement-of-cash/movement-of-cash.controller'
import MovementOfCash from './../movement-of-cash/movement-of-cash.interface'
import MovementOfCashSchema from './../movement-of-cash/movement-of-cash.model'
import PaymentMethodController from './../payment-method/payment-method.controller'
import PaymentMethod from './../payment-method/payment-method.interface'
import StructureController from './../structure/structure.controller'
import Structure, {Utilization} from './../structure/structure.interface'
import TransactionTypeController from './../transaction-type/transaction-type.controller'
import TransactionUC from './../transaction/transaction.uc'
import VariantValueController from './../variant-value/variant-value.controller'
import VariantController from './../variant/variant.controller'
import Variant from './../variant/variant.interface'
import VATConditionController from './../vat-condition/vat-condition.controller'

export default class WooCommerceController {
  path = '/woo/'
  router = express.Router()
  api: any
  database: string
  authToken: string
  application: Application
  clients: Client[] = [
    {
      db: 'eldesafio',
      serverURL: 'http://eldesafioll.con-ip.com',
      url: 'https://www.supereldesafio.com.ar',
      consumerKey: 'ck_f05fc11c91457f452836017faed9525635431cfc',
      consumerSecret: 'cs_ca384541c8aec3261a853991a1d1e96541b733a2',
    },
    {
      db: 'rango',
      serverURL: 'http://vps-1883265-x.dattaweb.com',
      url: 'https://rangostore.com.ar',
      consumerKey: 'ck_37841a7612d2b781293094f40d7c0eb6db8c2bdd',
      consumerSecret: 'cs_3705b1e470eaacb8252cbe00d47ba1778d1f9360',
    },
  ]
  client: Client
  _pArticleFields: ArticleField[] = new Array()
  _wTags: WTag[] = new Array()
  articleParentWooId: string
  articleParentId: string

  constructor(database: string) {
    this.database = database
    this.initializeRoutes()
  }

  private initializeRoutes() {
    this.router.post(`${this.path}sync`, [authMiddleware, ensureLic], this.sync)
    this.router.post(
      `${this.path}sync-article/:id`,
      [authMiddleware, ensureLic],
      this.syncArticle,
    )
    this.router.post(
      `${this.path}sync-category/:id`,
      [authMiddleware, ensureLic],
      this.syncCategory,
    )
    this.router.post(
      `${this.path}sync-article-field/:id`,
      [authMiddleware, ensureLic],
      this.syncArticleField,
    )
    this.router.post(
      `${this.path}sync-transactions`,
      [authMiddleware, ensureLic],
      this.importTransactions,
    )
    this.router.post(`${this.path}import`, [authMiddleware, ensureLic], this.import)
  }

  private async connect(database: string) {
    return new Promise(async (resolve, reject) => {
      try {
        if (!this.client || !this.application) {
          this.database = database

          for (let clientAux of this.clients) {
            if (clientAux.db === this.database) {
              this.client = clientAux
              if (!this.client.serverURL) this.client.serverURL = config.URL_SERVER
            }
          }

          if (this.client) {
            let options: woo.WooCommerceRestApiOptions = {
              url: this.client.url,
              consumerKey: this.client.consumerKey,
              consumerSecret: this.client.consumerSecret,
              version: 'wc/v3',
            }

            this.api = new woo.default(options)

            await this._pLoadApplication(this.client.url).then(
              async (result: Responseable) => {
                if (result.status === 200 && result.result && result.result.length > 0) {
                  this.application = result.result[0]
                }
              },
            )
          }
        }

        resolve(new Responser(200, this.client))
      } catch (error) {
        reject(error)
      }
    })
  }

  private sync = async (
    request: RequestWithUser,
    response: express.Response,
    next: express.NextFunction,
  ) => {
    try {
      this.authToken = request.headers.authorization
      await this.connect(request.database)
      if (this.application) {
        await this.syncCategories()
        await this.syncArticleFields()
        await this.syncValueArticleFields()
        await this.syncTags()
        await this.syncArticles()
      }
      response.send(new Responser(200, 'Finaliza sync'))
    } catch (error) {
      next(
        new HttpException(
          new Responser(
            error.status || 500,
            null,
            error.response && error.response.data
              ? error.response.data.message
              : error.message,
            error,
          ),
        ),
      )
    }
  }

  private syncArticle = async (
    request: RequestWithUser,
    response: express.Response,
    next: express.NextFunction,
  ) => {
    try {
      this.authToken = request.headers.authorization
      const articleId = request.params.id

      if (!articleId) throw new Error('Debe enviar id a sincronizar')
      await this.connect(request.database)
      if (this.application) {
        await this.syncArticles(articleId)
      }
      response.send(new Responser(200, 'Finaliza sync article'))
    } catch (error) {
      next(
        new HttpException(
          new Responser(
            error.status || 500,
            null,
            error.response && error.response.data
              ? error.response.data.message
              : error.message,
            error,
          ),
        ),
      )
    }
  }

  private syncCategory = async (
    request: RequestWithUser,
    response: express.Response,
    next: express.NextFunction,
  ) => {
    try {
      this.authToken = request.headers.authorization
      const categoryId = request.params.id

      await this.connect(request.database)
      if (this.application) await this.syncCategories(categoryId)
      response.send(new Responser(200, 'Finaliza sync category'))
    } catch (error) {
      next(
        new HttpException(
          new Responser(
            error.status || 500,
            null,
            error.response && error.response.data
              ? error.response.data.message
              : error.message,
            error,
          ),
        ),
      )
    }
  }

  private syncArticleField = async (
    request: RequestWithUser,
    response: express.Response,
    next: express.NextFunction,
  ) => {
    try {
      this.authToken = request.headers.authorization
      const articleFieldId = request.params.id

      await this.connect(request.database)
      if (this.application) {
        await this.syncArticleFields(articleFieldId)
        await this.syncValueArticleFields()
      }
      response.send(new Responser(200, 'Finaliza sync article field'))
    } catch (error) {
      next(
        new HttpException(
          new Responser(
            error.status || 500,
            null,
            error.response && error.response.data
              ? error.response.data.message
              : error.message,
            error,
          ),
        ),
      )
    }
  }

  private import = async (
    request: RequestWithUser,
    response: express.Response,
    next: express.NextFunction,
  ) => {
    try {
      this.authToken = request.headers.authorization
      await this.connect(request.database)
      if (this.application) {
        await this.importCategories()
        await this.importArticles()
      }
      response.send(new Responser(200, 'Finaliza sync'))
    } catch (error) {
      next(
        new HttpException(
          new Responser(
            error.status || 500,
            null,
            error.response && error.response.data
              ? error.response.data.message
              : error.message,
            error,
          ),
        ),
      )
    }
  }

  _pLoadApplication(url: string) {
    return new Promise((resolve, reject) => {
      new ApplicationController(this.database)
        .getAll({
          project: {_id: 1, url: 1, type: 1},
          match: {url: url, type: ApplicationType.Woocommerce},
        })
        .then((result: Responseable) => {
          if (result.result && result.result.length > 0)
            resolve(new Responser(200, result.result))
          else
            reject(
              new HttpException(
                new Responser(
                  500,
                  null,
                  'Aplicación no configurada.',
                  'Aplicación no configurada.',
                ),
              ),
            )
        })
        .catch((error: any) => reject(error))
    })
  }

  async importCategories() {
    return new Promise(async (resolve, reject) => {
      try {
        let _wCategories: any[] = new Array()

        await this.connect(this.database)
        let page = 1
        let per_page = 90
        let _wCategoriesAux: any[] = new Array()

        do {
          _wCategoriesAux = new Array()
          await this._wLoadCategories(page, per_page).then(
            async (result: Responseable) => {
              _wCategoriesAux = result.result
              _wCategories = _wCategories.concat(_wCategoriesAux)
            },
          )
          page++
        } while (_wCategoriesAux.length > 0)

        for (let _wCategory of _wCategories) {
          let _pCategory: Category = CategorySchema.getInstance(this.database)

          _pCategory.order = 1
          _pCategory.wooId = _wCategory.id
          _pCategory.description = _wCategory.name
          _pCategory.ecommerceEnabled = true
          _pCategory.applications = new Array()
          _pCategory.applications.push(this.application)
          if (_wCategory.image) {
            _pCategory.picture = _wCategory.image.src
          } else {
            _pCategory.picture = 'default.jpg'
          }

          let categories: Category[] = await this._pLoadCategories({
            description: _wCategory.name,
          })

          if (categories.length == 0) {
            if (_wCategory.parent && _wCategory.parent !== 0) {
              categories = await this._pLoadCategories({
                wooId: _wCategory.parent.toString(),
              })
              if (categories.length > 0) _pCategory.parent = categories[0]
            }
            await new CategoryController(this.database).save(_pCategory)
          } else {
            _pCategory._id = categories[0]._id
            await new CategoryController(this.database).update(_pCategory._id, {
              wooId: _wCategory.id,
              picture: _pCategory.picture,
            })
            if (!_pCategory.parent && _wCategory.parent && _wCategory.parent != 0) {
              categories = await this._pLoadCategories({
                wooId: _wCategory.parent.toString(),
              })
              if (categories.length > 0) {
                _pCategory.parent = categories[0]
                await new CategoryController(this.database).update(_pCategory._id, {
                  parent: _pCategory.parent,
                })
              }
            }
          }
        }

        resolve(new Responser(200, _wCategories))
      } catch (error) {
        reject(error)
      }
    })
  }

  _wLoadCategories(page: number = 1, per_page: number = 10) {
    return new Promise(async (resolve, reject) => {
      try {
        await this.connect(this.database)
        this.api
          .get(
            `products/categories?orderby=id&order=asc&page=${page}&per_page=${per_page}`,
          )
          .then((response: any) => {
            resolve(new Responser(200, response.data))
          })
      } catch (error) {
        reject(error)
      }
    })
  }

  async syncCategories(categoryId?: string) {
    return new Promise(async (resolve, reject) => {
      try {
        await this.connect(this.database)
        // CARGAMOS CATEGORÍAS DEL POS
        let _pCategories: Category[] = await this._pLoadCategories(
          categoryId ? {_id: {$oid: categoryId}} : {},
        )

        for (let _pCategory of _pCategories) {
          if (_pCategory.wooId) {
            if (_pCategory.ecommerceEnabled) {
              await this._wUpdateCategory(_pCategory)
            } else {
              // QUITAMOS WOO ID DE LA CATEGORIA SI SE DESPUBLICA
              await this._wDeleteCategory(_pCategory)
              await new CategoryController(this.database).update(_pCategory._id, {
                wooId: null,
              })
            }
          } else {
            await this._wSaveCategory(_pCategory).then(async (result: Responseable) => {
              let _wCategory: any = result.result

              await new CategoryController(this.database).update(_pCategory._id, {
                wooId: _wCategory.id,
              })
            })
          }
        }

        resolve(new Responser(200, _pCategories))
      } catch (error) {
        reject(error)
      }
    })
  }

  _pLoadCategories(match: {} = {}): Promise<Category[]> {
    return new Promise<Category[]>((resolve, reject) => {
      match = {
        ...match,
        $or: [
          {
            applications: {$oid: this.application._id},
            operationType: {$ne: 'D'},
            ecommerceEnabled: true,
          },
          {
            applications: {$oid: this.application._id},
            wooId: {$exists: true, $ne: '0'},
            operationType: {$ne: 'D'},
          },
        ],
      }
      new CategoryController(this.database)
        .getAll({
          project: {
            _id: 1,
            description: 1,
            picture: 1,
            operationType: 1,
            ecommerceEnabled: 1,
            applications: 1,
            observation: 1,
            'parent.wooId': 1,
            wooId: 1,
          },
          match: match,
          sort: {description: 1},
        })
        .then((result: Responseable) => {
          if (result.status === 200) {
            resolve(result.result)
          } else reject(result)
        })
        .catch((error: any) => reject(error))
    })
  }

  async _wSaveCategory(category: Category) {
    return new Promise(async (resolve, reject) => {
      try {
        await this.connect(this.database)
        let image: {src: string}
        let baseURL: string = `${this.client.serverURL}/${this.database}/images/category`

        if (category.picture && category.picture !== 'default.jpg') {
          if (category.picture.includes(this.client.url)) {
            image = {src: `${category.picture}`}
          } else {
            image = {src: `${baseURL}/${category.picture}`}
          }
        }
        this.api
          .post('products/categories', {
            name: category.description,
            parent: category.parent ? category.parent.wooId : 0,
            image,
          })
          .then((response: any) => {
            resolve(new Responser(200, response.data))
          })
      } catch (error) {
        reject(error)
      }
    })
  }

  async _wUpdateCategory(category: Category) {
    return new Promise(async (resolve, reject) => {
      try {
        await this.connect(this.database)
        let image: {src: string}
        let baseURL: string = `${this.client.serverURL}/${this.database}/images/category`

        if (category.picture && category.picture !== 'default.jpg') {
          if (category.picture.includes(this.client.url)) {
            image = {src: `${category.picture}`}
          } else {
            image = {src: `${baseURL}/${category.picture}`}
          }
        }
        await this.api
          .put(`products/categories/${category.wooId}`, {
            name: category.description,
            parent: category.parent ? category.parent.wooId : 0,
            image,
          })
          .then((response: any) => {
            resolve(new Responser(200, response.data))
          })
      } catch (error) {
        reject(error)
      }
    })
  }

  async _wDeleteCategory(category: Category) {
    return new Promise(async (resolve, reject) => {
      try {
        await this.connect(this.database)
        await this.api
          .delete(`products/categories/${category.wooId}?force=true`)
          .then((response: any) => {
            resolve(new Responser(200, response.data))
          })
      } catch (error) {
        reject(error)
      }
    })
  }

  async syncArticles(articleId?: string) {
    return new Promise(async (resolve, reject) => {
      try {
        await this.connect(this.database)

        let _pArticles: Article[] = await this._pLoadArticles({_id: {$oid: articleId}})

        for (let _pArticle of _pArticles) {
          await this.syncTags(_pArticle._id)
          let stock: number = 0
          let _wOtherFields: WOtherField[] = new Array()
          let _WAttribute: wAttribute[] = new Array()

          if (!_pArticle.allowSaleWithoutStock) {
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
          }

          if (_pArticle.otherFields && _pArticle.otherFields.length > 0) {
            for (let _pOtherField of _pArticle.otherFields) {
              for (let _pArticleField of this._pArticleFields) {
                if (_pArticleField._id == _pOtherField.articleField.toString()) {
                  _pOtherField.articleField = _pArticleField
                }
              }
              let exists: boolean = false

              if (_wOtherFields && _wOtherFields.length > 0) {
                for (let _wOtherField of _wOtherFields) {
                  if (_wOtherField.name === _pOtherField.articleField.name) {
                    exists = true
                    _wOtherField.options.push(_pOtherField.value)
                  }
                }
              }
              if (!exists) {
                _wOtherFields.push({
                  name: _pOtherField.articleField.name,
                  options: [_pOtherField.value],
                  visible: true,
                  variation: false,
                })
              }
            }
          }

          if (_pArticle.containsVariants) {
            let option: string[] = []
            const match = {
              articleParent: {$oid: _pArticle._id},
              operationType: {$ne: 'D'},
            }
            let articleVariants: Variant[] = await this.articleVariants(match)

            for (let variant of articleVariants) {
              option.push(
                await new VariantValueController(this.database)
                  .getById(variant.value.toString())
                  .then((r: any) => {
                    return r.result.description
                  }),
              )
            }
            let resultSize = option.filter((item, index) => {
              if (item.length < 3) {
                return option.indexOf(item) === index
              }
            })
            let resultColor = option.filter((item, index) => {
              if (item.length > 3) {
                return option.indexOf(item) === index
              }
            })

            if (resultSize.length > 0) {
              _WAttribute = [
                {
                  id: 1,
                  position: 0,
                  visible: true,
                  variation: true,
                  options: resultSize,
                },
              ]
            }
            if (resultColor.length > 0) {
              _WAttribute.push({
                name: 'Color',
                options: resultColor,
                visible: true,
                variation: true,
              })
            }
          }
          // CONVERTIR TAGS
          let _wTagsAux: WTag[] = new Array()

          for (let _pTag of _pArticle.tags) {
            for (let _wTag of this._wTags) {
              if (_wTag.name === _pTag) {
                _wTagsAux.push(_wTag)
              }
            }
          }

          if (articleId && _pArticle.type === 'Final') {
            await this.syncCategories(_pArticle.category.toString()).then(
              async (result: Responseable) => {
                _pArticle.category = result.result[0]
              },
            )
          }
          if (_pArticle.wooId) {
            if (_pArticle.operationType === 'D') {
              await this._wDeleteArticle(_pArticle)
            } else {
              await this._wUpdateArticle(
                _pArticle,
                stock,
                _wOtherFields,
                _wTagsAux,
                _WAttribute,
              )
            }
          } else {
            let _wArticleId: string = await this._wSaveArticle(
              _pArticle,
              stock,
              _wOtherFields,
              _wTagsAux,
              _WAttribute,
            )

            await this._pUpdateArticle(_pArticle._id, {wooId: _wArticleId})
          }
        }
        resolve(new Responser(200, _pArticles))
      } catch (error) {
        reject(error)
      }
    })
  }

  async importArticles() {
    return new Promise(async (resolve, reject) => {
      try {
        let _wArticles: any[] = new Array()

        await this.connect(this.database)

        let page = 1
        let per_page = 90
        let _wArticlesAux: any[] = new Array()

        do {
          _wArticlesAux = await this._wLoadArticles(page, per_page)
          _wArticles = _wArticles.concat(_wArticlesAux)
          page++
        } while (_wArticlesAux.length > 0)

        await this.importCategories()

        for (let _wArticle of _wArticles) {
          // VERIFICAMOS SI EXISTE LA CATEGORÍA EN EL POS
          let articles: Article[] = await this._pLoadArticles({
            description: _wArticle.name,
          })
          let _pArticle: Article = ArticleSchema.getInstance(this.database)

          _pArticle.wooId = _wArticle.id
          try {
            _pArticle.url = _wArticle.permalink
              .split(this.client.db + '/product/')[0]
              .split('/')[0]
          } catch (error) {}
          _pArticle.type = 'Final'
          _pArticle.picture = 'default.jpg'
          _pArticle.ecommerceEnabled = true
          _pArticle.applications = new Array()
          _pArticle.applications.push(this.application)
          _pArticle.observation = _wArticle.description
          _pArticle.salePrice = _wArticle.price
          _pArticle.basePrice = parseFloat((_pArticle.salePrice / 1.21).toFixed(2))
          _pArticle.taxes = [
            {
              taxAmount: parseFloat(((_pArticle.basePrice * 21) / 100).toFixed(2)),
              taxBase: _pArticle.basePrice,
              percentage: 21,
              tax: null,
            },
          ]
          _pArticle.costPrice =
            _pArticle.basePrice +
            parseFloat(((_pArticle.basePrice * 21) / 100).toFixed(2))
          _pArticle.allowSaleWithoutStock = !_wArticle.manage_stock

          if (_wArticle.categories && _wArticle.categories.length > 0) {
            let categories: Category[] = await this._pLoadCategories({
              wooId: _wArticle.categories,
            })

            if (categories.length > 0) _pArticle.category = articles[0].category
          }
          _pArticle.tags = _wArticle.tags
          // IMPORTAR IMAGENES
          if (_wArticle.images) {
            for (let image of _wArticle.images) {
              _pArticle.pictures = new Array()
              _pArticle.pictures.push({picture: image.src})
            }
          }

          if (articles.length == 0) {
            await new ArticleController(this.database).save(_pArticle)
          } else {
            if (_wArticle.images.length > 0) {
              _pArticle._id = articles[0]._id
              await new ArticleController(this.database).update(_pArticle._id, {
                wooId: _wArticle.id,
                pictures: _pArticle.pictures,
              })
            }
          }
        }

        resolve(new Responser(200, _wArticles))
      } catch (error) {
        reject(error)
      }
    })
  }

  async _pLoadArticles(match: any = {}): Promise<Article[]> {
    return new Promise<Article[]>(async (resolve) => {
      let articles: Article[] = []

      await this.connect(this.database)
      if (this.application) {
        if (!match['wooId']) {
          match = {
            ...match,
            $or: [
              {
                applications: {$oid: this.application._id},
                type: 'Final',
                operationType: {$ne: 'D'},
                ecommerceEnabled: true,
                allowSale: true,
                forShipping: false,
              },
              {
                applications: {$oid: this.application._id},
                wooId: {
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
              currency: 1,
              deposits: 1,
              locations: 1,
              children: 1,
              pictures: 1,
              barcode: 1,
              operationType: 1,
              wooId: 1,
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
              category: 1,
              'make.description': 1,
            },
            match,
          })
          .then((result: Responseable) => {
            articles = result.result
          })
      }
      resolve(articles)
    })
  }

  async _pUpdateArticle(_id: string, params: any) {
    return new Promise(async (resolve, reject) => {
      try {
        await this.connect(this.database)
        await new ArticleController(this.database)
          .update(_id, params)
          .then((result: Responseable) => {
            resolve(result)
          })
      } catch (error) {
        reject(error)
      }
    })
  }

  _wLoadArticles(page: number = 1, per_page: number = 10): Promise<any[]> {
    return new Promise(async (resolve, reject) => {
      try {
        await this.connect(this.database)
        this.api
          .get(`products?orderby=id&order=asc&page=${page}&per_page=${per_page}`)
          .then((response: any) => {
            resolve(response.data)
          })
      } catch (error) {
        reject(error)
      }
    })
  }

  async _wSaveArticle(
    article: Article,
    stock: number,
    _wOtherFields: WOtherField[],
    _wTags: WTag[],
    _WAttribute: wAttribute[],
  ): Promise<string> {
    return new Promise(async (resolve, reject) => {
      try {
        await this.connect(this.database)

        let images: {src: string}[] = new Array()
        let baseURL: string = `${this.client.serverURL}/${this.database}/images/article`

        if (article.picture && article.picture !== 'default.jpg') {
          if (article.picture.includes(this.client.url)) {
            images.push({src: `${article.picture}`})
          } else {
            images.push({src: `${baseURL}/${article.picture}`})
          }
        }
        if (article.pictures && article.pictures.length > 0) {
          for (let image of article.pictures) {
            if (image.picture.includes(this.client.url)) {
              images.push({src: `${image.picture}`})
            } else {
              images.push({src: `${baseURL}/${image.picture}`})
            }
          }
        }
        let type
        let attribute

        article.containsVariants ? (type = 'variable') : (type = 'simple')
        _wOtherFields.length === 0
          ? (attribute = _wOtherFields)
          : (attribute = _WAttribute)
        let data = {
          name:
            article.make && article.make.description
              ? `${article.make.description} ${article.description}`
              : article.description,
          type: type,
          regular_price: article.salePrice.toString(),
          sale_price: article.salePrice.toString(),
          status: article.ecommerceEnabled ? 'publish' : 'draft',
          description: article.observation,
          sku: article.code,
          manage_stock: !article.allowSaleWithoutStock,
          stock_quantity: stock,
          stock_status: stock > 0 ? 'instock' : 'outofstock',
          tags: _wTags,
          categories: article.category
            ? [
                {
                  id: article.category.wooId,
                },
              ]
            : [],
          images,
          attributes: attribute,
        }

        if (article.type === 'Final') {
          await this.api.post('products', data).then((response: any) => {
            this.articleParentWooId = response.data.id
          })
        }

        if (article.type === 'Final' && article.containsVariants) {
          this.articleParentId = article._id

          // Buscar variables
          const match = {
            articleParent: {$oid: article._id},
            operationType: {$ne: 'D'},
          }
          let articleVariants: Variant[] = await this.articleVariants(match)

          articleVariants = articleVariants.reduce(
            (allVariants, variantChildren: Variant) => {
              return Array.from(
                new Set([...allVariants, ...[variantChildren.articleChild.toString()]]),
              )
            },
            [],
          )

          for (let variant of articleVariants) {
            await this.syncArticles(variant.toString())
          }
          resolve(this.articleParentWooId)
        }

        if (article.type === 'Variante') {
          await this._wSaveVariants(article, stock, images)

          resolve(this.articleParentWooId)
        }
      } catch (error) {
        reject(error)
      }
    })
  }

  async _wUpdateArticle(
    article: Article,
    stock: number,
    _wOtherFields: WOtherField[],
    _wTags: WTag[],
    _WAttribute: wAttribute[],
  ) {
    return new Promise(async (resolve, reject) => {
      try {
        await this.connect(this.database)
        let images: {src: string}[] = new Array()
        let imagesWoo: string[] = new Array()
        let imagesPos: string[] = new Array()
        let baseURL: string = `${this.client.serverURL}/${this.database}/images/article`

        await this._wGetArticleById(article.wooId).then((response: any) => {
          if (response && response['images'] && response['images'].length > 0) {
            for (let img of response['images']) {
              imagesWoo.push(img.src)
            }
          }
        })

        if (article.picture && article.picture !== 'default.jpg')
          imagesPos.push(article.picture)
        if (article.pictures && article.pictures.length > 0) {
          for (let image of article.pictures) {
            imagesPos.push(`${image.picture}`)
          }
        }

        if (imagesPos.length > 0) {
          for (let namePos of imagesPos) {
            let isValid: boolean = true

            for (let imgWoo of imagesWoo) {
              const nameWoo = imgWoo.split('/')[imgWoo.split('/').length - 1]

              if (nameWoo === `${namePos.split('.')[0]}-scaled.${namePos.split('.')[1]}`)
                isValid = false
            }
            if (isValid) images.push({src: `${baseURL}/${namePos}`})
          }
        }

        if (imagesWoo && imagesWoo.length > 0) {
          for (let imgWoo of imagesWoo) {
            const nameWoo = imgWoo.split('/')[imgWoo.split('/').length - 1]
            let exists: boolean = false

            for (let namePos of imagesPos) {
              if (nameWoo === `${namePos.split('.')[0]}-scaled.${namePos.split('.')[1]}`)
                exists = true
            }
            if (exists) {
              images.push({src: imgWoo})
            }
          }
        }

        let sku
        let type
        let attribute

        article.type === 'Final' ? (sku = article.code) : (sku = article._id)
        article.containsVariants ? (type = 'variable') : (type = 'simple')
        _wOtherFields.length !== 0
          ? (attribute = _wOtherFields)
          : (attribute = _WAttribute)

        const values = {
          name:
            article.make && article.make.description
              ? `${article.make.description} ${article.description}`
              : article.description,
          type: type,
          regular_price: article.salePrice.toString(),
          sale_price: article.salePrice.toString(),
          status: article.ecommerceEnabled ? 'publish' : 'draft',
          description: article.observation,
          sku: sku,
          manage_stock: !article.allowSaleWithoutStock,
          stock_quantity: stock,
          stock_status: article.allowSaleWithoutStock
            ? 'instock'
            : stock > 0
            ? 'instock'
            : 'outofstock',
          tags: _wTags,
          categories: article.category
            ? [
                {
                  id: article.category.wooId,
                },
              ]
            : [],
          images,
          attributes: attribute,
        }

        if (article.type === 'Final' && article.containsVariants) {
          this.articleParentWooId = article.wooId
          this.articleParentId = article._id

          // Buscar variables
          const match = {
            articleParent: {$oid: article._id},
            operationType: {$ne: 'D'},
          }
          let articleVariants: Variant[] = await this.articleVariants(match)

          articleVariants = articleVariants.reduce(
            (allVariants, variantChildren: Variant) => {
              return Array.from(
                new Set([...allVariants, ...[variantChildren.articleChild.toString()]]),
              )
            },
            [],
          )

          await this.deleteWVariants()

          // Antes de sincronizar hay q preguntar si ya estan esas variables y updapear
          for (let variant of articleVariants) {
            await this.syncArticles(variant.toString())
          }
          resolve(new Responser(200))
        }

        if (article.type === 'Final') {
          await this.api
            .put(`products/${article.wooId}`, values)
            .then(async (response: any) => {
              await new ArticleController(this.database).update(article._id, {
                url: response.data.permalink,
              })
              resolve(new Responser(200, response.data))
            })
        }

        if (article.type === 'Variante') {
          const data = await this._wSaveVariants(article, stock, images)

          resolve(new Responser(200, data))
        }
      } catch (error) {
        reject(error)
      }
    })
  }

  async _wSaveVariants(variant: Article, stock: number, images: {src: string}[]) {
    return new Promise(async (resolve, reject) => {
      try {
        const match = {
          articleParent: {$oid: this.articleParentId},
          articleChild: {$oid: variant._id},
          operationType: {$ne: 'D'},
        }
        let articleVariants: Variant[] = await this.articleVariants(match)
        let _wAttribute: WVariant[] = []

        for (let variant of articleVariants) {
          const variantValueResponse: Responseable = await new VariantValueController(
            this.database,
          ).getAll({
            project: {_id: 1, description: 1, 'type.name': 1},
            match: {_id: {$oid: variant.value.toString()}},
          })

          const variantValue: VariantValue = variantValueResponse.result[0]

          _wAttribute.push({
            name: variantValue.type.name,
            option: variantValue.description,
          })
        }

        const data = {
          description: variant.description,
          regular_price: variant.salePrice.toString(),
          image: images[0],
          attributes: _wAttribute,
          sale_price: variant.salePrice.toString(),
          status: variant.ecommerceEnabled ? 'publish' : 'draft',
          manage_stock: !variant.allowSaleWithoutStock,
          stock_quantity: stock,
          stock_status: stock > 0 ? 'instock' : 'outofstock',
        }

        await this.api
          .post(`products/${this.articleParentWooId}/variations`, data)
          .then(async (response: any) => {
            await new ArticleController(this.database).update(variant._id, {
              url: response.data.permalink,
              wooId: response.data.id,
            })
            resolve(new Responser(200, response.data))
          })
      } catch (error) {
        reject(error)
      }
    })
  }

  async articleVariants(match: object): Promise<Variant[]> {
    return new Promise(async (resolve) => {
      await new VariantController(this.database)
        .getAll({
          project: {
            _id: 1,
            articleParent: 1,
            articleChild: 1,
            operationType: 1,
            value: 1,
            type: 1,
          },
          match: match,
        })
        .then((r) => {
          if (r.status === 200 && r.result.length > 0) {
            resolve(r.result)
          }
        })
    })
  }

  async deleteWVariants(): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        let childrens = await this.api
          .get(`products/${this.articleParentWooId}/variations`, {
            per_page: 100,
          })
          .then(async (r: any) => {
            return r.data
          })

        if (childrens && childrens.length > 0) {
          for (const children of childrens) {
            await this.api.delete(
              `products/${this.articleParentWooId}/variations/${children.id}`,
              {
                force: true,
              },
            )
          }
        }
        resolve()
      } catch (error) {
        reject(error)
      }
    })
  }
  async _wGetArticleById(id: string) {
    return new Promise(async (resolve, reject) => {
      try {
        await this.api.get(`products/${id}`).then((response: any) => {
          resolve(response.data)
        })
      } catch (error) {
        reject(error)
      }
    })
  }

  async _wDeleteArticle(article: Article) {
    return new Promise(async (resolve, reject) => {
      try {
        await this.connect(this.database)
        await this.api
          .delete(`products/${article.wooId}?force=true`)
          .then((response: any) => {
            resolve(response.data)
          })
      } catch (error) {
        reject(error)
      }
    })
  }

  getStockByArticle(article: Article) {
    return new Promise((resolve, reject) => {
      new ArticleStockController(this.database)
        .getAll({
          project: {article: 1, realStock: 1},
          match: {article: {$oid: article._id}},
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

  /* CAMPOS PERSONALIZADOS */
  async syncArticleFields(articleFieldId?: string) {
    return new Promise(async (resolve, reject) => {
      try {
        await this.connect(this.database)
        this._pArticleFields = await this._pLoadArticleFields({
          _id: {$oid: articleFieldId},
        })
        for (let _pArticleField of this._pArticleFields) {
          if (_pArticleField.wooId) {
            if (_pArticleField.operationType === 'D') {
              await this._wDeleteArticleField(_pArticleField)
            } else {
              await this._wUpdateArticleField(_pArticleField)
            }
          } else {
            let _wArticleField: any = await this._wSaveArticleField(_pArticleField)

            await new ArticleFieldController(this.database).update(_pArticleField._id, {
              wooId: _wArticleField.id,
            })
          }
        }

        resolve(new Responser(200, this._pArticleFields))
      } catch (error) {
        reject(error)
      }
    })
  }

  _pLoadArticleFields(match: {} = {}): Promise<ArticleField[]> {
    return new Promise<ArticleField[]>((resolve, reject) => {
      match = {
        ...match,
        $or: [
          {
            operationType: {$ne: 'D'},
            ecommerceEnabled: true,
          },
          {
            wooId: {$exists: true, $ne: '0'},
            operationType: {$ne: 'D'},
          },
        ],
      }
      new ArticleFieldController(this.database)
        .getAll({
          project: {
            _id: 1,
            name: 1,
            datatype: 1,
            ecommerceEnabled: 1,
            value: 1,
            wooId: 1,
            operationType: 1,
          },
          match,
        })
        .then((result: Responseable) => {
          if (result.status === 200) {
            resolve(result.result)
          } else reject(result)
        })
        .catch((error: any) => reject(error))
    })
  }

  async _wSaveArticleField(articleField: ArticleField) {
    return new Promise(async (resolve, reject) => {
      try {
        await this.connect(this.database)
        await this.api
          .post('products/attributes', {
            name: articleField.name,
          })
          .then((response: any) => {
            resolve(response.data)
          })
      } catch (error) {
        reject(error)
      }
    })
  }

  async _wUpdateArticleField(articleField: ArticleField) {
    return new Promise(async (resolve, reject) => {
      try {
        await this.connect(this.database)
        await this.api
          .put(`products/attributes/${articleField.wooId}`, {
            name: articleField.name,
          })
          .then((response: any) => {
            resolve(response.data)
          })
      } catch (error) {
        reject(error)
      }
    })
  }

  async _wDeleteArticleField(articleField: ArticleField) {
    return new Promise(async (resolve, reject) => {
      try {
        await this.connect(this.database)
        await this.api
          .delete(`products/attributes/${articleField.wooId}?force=true`)
          .then((response: any) => {
            resolve(response.data)
          })
      } catch (error) {
        reject(error)
      }
    })
  }
  /* FIN CAMPOS PERSONALIZADOS */

  /* VALOR CAMPOS PERSONALIZADOS */
  async syncValueArticleFields() {
    return new Promise(async (resolve, reject) => {
      try {
        await this.connect(this.database)

        let _pValueArticleFields: {field: string; value: string}[] = new Array()
        let _wValueArticleFields: any[] = new Array()

        for (let _pArticleField of this._pArticleFields) {
          if (_pArticleField.datatype !== ArticleFieldType.Array) {
            _pValueArticleFields.push({
              field: _pArticleField.wooId,
              value: _pArticleField.value,
            })
          } else {
            for (let _pValues of _pArticleField.value.split(';')) {
              _pValueArticleFields.push({field: _pArticleField.wooId, value: _pValues})
            }
          }
        }

        for (let _pArticleField of this._pArticleFields) {
          _wValueArticleFields = await this._wLoadValueArticleFields(_pArticleField)

          // RECORREMOS PARA ELIMINAR
          for (let _wValueArticleField of _wValueArticleFields) {
            let exists: boolean = false

            for (let _pValueArticleField of _pValueArticleFields) {
              if (_wValueArticleField.name === _pValueArticleField.value) {
                exists = true
              }
            }
            if (!exists)
              await this._wDeleteValueArticleField(
                _pArticleField.wooId,
                _wValueArticleField,
              )
          }

          // RECORREMOS PARA AGREGAR
          for (let _pValueArticleField of _pValueArticleFields) {
            if (_pValueArticleField.field === _pArticleField.wooId) {
              let exists: boolean = false

              for (let _wValueArticleField of _wValueArticleFields) {
                if (_wValueArticleField.name === _pValueArticleField.value) {
                  exists = true
                }
              }
              if (!exists) await this._wSaveValueArticleField(_pValueArticleField)
            }
          }
        }

        resolve(new Responser(200, _pValueArticleFields))
      } catch (error) {
        reject(error)
      }
    })
  }

  _wUpdateOrder(wooId: string): Promise<any> {
    return new Promise<any[]>(async (resolve, reject) => {
      try {
        await this.connect(this.database)

        const data = {
          status: 'completed',
        }

        return this.api.put('orders/' + wooId, data).then((response: any) => {
          resolve(response.data)
        })
      } catch (error) {
        reject(error)
      }
    })
  }

  _wLoadValueArticleFields(_pArticleField: ArticleField): Promise<any[]> {
    return new Promise<any[]>(async (resolve, reject) => {
      try {
        await this.connect(this.database)
        await this.api
          .get(`products/attributes/${_pArticleField.wooId}/terms`)
          .then((response: any) => {
            resolve(response.data)
          })
      } catch (error) {
        reject(error)
      }
    })
  }

  async _wSaveValueArticleField(_pValueArticleField: {
    field: string
    value: string
  }): Promise<any> {
    return new Promise<any>(async (resolve, reject) => {
      try {
        await this.connect(this.database)
        await this.api
          .post(`products/attributes/${_pValueArticleField.field}/terms`, {
            name: _pValueArticleField.value,
          })
          .then((response: any) => {
            resolve(response.data)
          })
      } catch (error) {
        reject(error)
      }
    })
  }

  async _wDeleteValueArticleField(field: string, _wValueArticleField: any) {
    return new Promise(async (resolve, reject) => {
      try {
        await this.connect(this.database)
        await this.api
          .delete(
            `products/attributes/${field}/terms/${_wValueArticleField.id}?force=true`,
          )
          .then((response: any) => {
            resolve(new Responser(200, response.data))
          })
      } catch (error) {
        reject(error)
      }
    })
  }
  /* FIN VALOR CAMPOS PERSONALIZADOS */

  /* TAGS */
  async syncTags(articleId?: string) {
    return new Promise(async (resolve, reject) => {
      try {
        let _pTags: any[] = new Array()

        await this.connect(this.database)
        _pTags = await this._pLoadTags(articleId)

        // RECORREMOS PARA AGREGAR
        for (let _pTag of _pTags) {
          let exists: boolean = false

          await this._wLoadTags(_pTag).then(async (result: Responseable) => {
            if (result.result.length > 0) exists = true
          })

          if (!exists) await this._wSaveTag(_pTag)
        }

        resolve(new Responser(200, _pTags))
      } catch (error) {
        reject(error)
      }
    })
  }

  async _pLoadTags(articleId?: string): Promise<any[]> {
    return new Promise<any[]>(async (resolve, reject) => {
      try {
        let _pTags: any[] = new Array()

        await this.connect(this.database)
        let match: any = {
          ecommerceEnabled: true,
          operationType: {$ne: 'D'},
          applications: {$oid: this.application._id},
        }

        if (articleId) match['_id'] = {$oid: articleId}
        await new ArticleController(this.database)
          .getAll({
            project: {
              _id: 1,
              tags: 1,
              operationType: 1,
              ecommerceEnabled: 1,
              applications: 1,
            },
            match,
          })
          .then((result: Responseable) => {
            let exists: boolean = false
            let articles: Article[] = result.result

            for (let article of articles) {
              for (let tag of article.tags) {
                for (let _pTag of _pTags) {
                  if (tag === _pTag) exists = true
                }
                if (!exists) _pTags.push(tag)
              }
            }
          })

        resolve(_pTags)
      } catch (error) {
        reject(error)
      }
    })
  }

  _wLoadTags(name: string) {
    return new Promise(async (resolve, reject) => {
      try {
        await this.connect(this.database)
        await this.api
          .get(`products/tags${name ? `?search=${name}&per_page=100` : ''}`)
          .then((response: any) => {
            if (response.data.length > 0 && name) {
              let tags: any[] = new Array()

              for (let _wTag of response.data) {
                if (_wTag.name === name) {
                  tags.push(_wTag)
                  this._wTags.push({
                    id: _wTag.id,
                    name: _wTag.name,
                  })
                  break
                }
              }
              resolve(new Responser(200, response.data))
            } else resolve(new Responser(200, response.data))
          })
      } catch (error) {
        reject(error)
      }
    })
  }

  async _wSaveTag(tag: string) {
    return new Promise(async (resolve, reject) => {
      try {
        await this.connect(this.database)
        await this.api
          .post(`products/tags`, {
            name: tag,
          })
          .then((response: any) => {
            this._wTags.push({
              id: response.data.id,
              name: response.data.name,
            })
            resolve(response.data)
          })
      } catch (error) {
        reject(error)
      }
    })
  }

  async _wDeleteTag(tagId: string) {
    return new Promise(async (resolve, reject) => {
      try {
        await this.connect(this.database)
        this.api.delete(`products/tags/${tagId}?force=true`).then((response: any) => {
          resolve(response.data)
        })
      } catch (error) {
        reject(error)
      }
    })
  }
  /* FIN TAGS */

  /* TRANSACTIONS */
  private importTransactions = async (
    request: RequestWithUser,
    response: express.Response,
    next: express.NextFunction,
  ) => {
    try {
      this.authToken = request.headers.authorization
      let _wTransactions: any[] = new Array()
      let _pTransactionType: TransactionType
      let _pCompany: Company
      let _pShipmentMethod: ShipmentMethod
      let _pLastTransaction: Transaction
      let _pAddress: Address

      await this.connect(request.database)
      if (this.application) {
        _pTransactionType = (await this._pLoadTransactionsTypes())[0]
        _pLastTransaction = (
          await this._pLoadTransactions({
            match: {wooId: {$exists: true}},
            sort: {wooId: -1},
            limit: 1,
          })
        )[0]

        let page = 1
        let per_page = 10
        let _wTransactionsAux: any[]

        do {
          _wTransactionsAux = new Array()
          // CARGAMOS TRANSACCIONES DE WOO
          _wTransactionsAux = await this._wLoadTransactions(page, per_page)
          if (_pLastTransaction) {
            for (let _wTransaction of _wTransactionsAux) {
              if (_wTransaction.id > _pLastTransaction.wooId) {
                _wTransactions.push(_wTransaction)
              }
            }
          } else {
            _wTransactions = _wTransactions.concat(_wTransactionsAux)
          }
          page++
        } while (_wTransactionsAux.length > 0)

        for (let _wTransaction of _wTransactions) {
          let billing: any
          // SI TIENE COMPANIA ASOCIADA
          let where: {} = {operationType: {$ne: 'D'}}

          if (_wTransaction.customer_id) {
            where = {
              ...where,
              $or: [
                {
                  wooId: _wTransaction.customer_id.toString(),
                  emails: _wTransaction.billing.email,
                },
              ],
            }
          } else {
            where = {...where, emails: _wTransaction.billing.email}
          }
          // BUSCAMOS SI ESTA REGISTRADA EN EL POS
          let companies: Company[] = await this._pLoadCompanies(where)

          if (companies.length > 0) {
            _pCompany = companies[0]
          } else if (_wTransaction.customer_id) {
            // SI NO ESTA REGISTRADA BUSCAMOS LOS DATOS EN WOOCOMERCE
            let _wCompany: any = await this._wLoadCompany(_wTransaction.customer_id)

            billing = _wCompany.billing
          } else {
            billing = _wTransaction.billing
          }

          // SI NO ESTA REGISTRADA, GUARDAMOS EN EL POS
          if (!_pCompany) {
            _pCompany = CompanySchema.getInstance(this.database)
            _pCompany.wooId = _wTransaction.customer_id
            _pCompany.name = billing.first_name + ' ' + billing.last_name
            _pCompany.emails = billing.email
            _pCompany.address = billing.address_1
            _pCompany.city = billing.city
            _pCompany.phones = billing.phone
         //   _pCompany.entryDate = moment().format('YYYY-MM-DDTHH:mm:ssZ')
            _pCompany.type = CompanyType.CLIENT
            _pCompany.allowCurrentAccount = true

            // BUSCAMOS CONDICION DE IVA CONSUMIDOR FINAL
            let VATConditions: VATCondition[] = await this._pLoadVatConditions({
              description: 'Consumidor Final',
              operationType: {$ne: 'D'},
            })

            if (VATConditions.length === 0)
              throw new Error('Debe cargar la condición de iva Consumidor Final.')
            _pCompany.vatCondition = VATConditions[0]
            // GUARDAMOS LA COMPANY EN EL POS
            await new CompanyController(this.database)
              .save(_pCompany)
              .then(async (result: Responseable) => {
                _pCompany = result.result
              })
          }

          // SI TIENE METODO DE ENTREGA ASOCIADO
          if (_wTransaction.shipping_lines && _wTransaction.shipping_lines.length > 0) {
            // BUSCAMOS SI ESTA REGISTRADA EN EL POS
            await this._pLoadShipmentMethods({
              wooId: _wTransaction.shipping_lines.id,
            }).then(async (result: Responseable) => {
              if (result.result.length > 0) {
                _pShipmentMethod = result.result[0]
              } else {
                _pShipmentMethod = ShipmentMethodSchema.getInstance(this.database)
                _pShipmentMethod.name = _wTransaction.shipping_lines[0].method_title
                _pShipmentMethod.wooId = _wTransaction.shipping_lines[0].id
                // GUARDAMOS LA METODO DE ENTREGA EN EL POS
                await new ShipmentMethodController(this.database)
                  .save(_pShipmentMethod)
                  .then(async (result: Responseable) => {
                    _pShipmentMethod = result.result
                  })
              }
            })
          }

          if (_wTransaction.shipping.address_1) {
            _pAddress = AddressSchema.getInstance(this.database)
            _pAddress.name = _wTransaction.shipping.address_1
            _pAddress.city = _wTransaction.shipping.city
            _pAddress.postalCode = _wTransaction.shipping.postcode
            _pAddress.company = _pCompany
            await new AddressController(this.database)
              .save(_pAddress)
              .then(async (result: Responseable) => {
                _pAddress = result.result
              })
          }

          let _pTransaction: Transaction = TransactionSchema.getInstance(this.database)
          const origin: number = _pTransactionType.fixedOrigin
            ? _pTransactionType.fixedOrigin
            : 0
          const letter: string = _pTransactionType.fixedLetter
            ? _pTransactionType.fixedLetter
            : 'X'
          const number = _wTransaction.number
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
          let depositOrigin: Deposit
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
              depositOrigin = result.result[0]
              depositDestination = result.result[0]
            })
          _pTransaction = Object.assign(_pTransaction, {
            origin,
            letter,
            number,
            basePrice: 0,
            exempt: 0,
            balance: _wTransaction.total,
            totalPrice: _wTransaction.total,
            state: TransactionState.Delivered,
            type: _pTransactionType,
            date: _wTransaction.date_completed_gmt
              ? _wTransaction.date_completed_gmt
              : _wTransaction.date_created_gmt,
            endDate: _wTransaction.date_completed_gmt
              ? _wTransaction.date_completed_gmt
              : _wTransaction.date_created_gmt,
            startDate: _wTransaction.date_created_gmt,
            expirationDate: _wTransaction.date_completed_gmt
              ? _wTransaction.date_completed_gmt
              : _wTransaction.date_created_gmt,
            VATPeriod: moment(
              _wTransaction.date_completed_gmt
                ? _wTransaction.date_completed_gmt
                : _wTransaction.date_created_gmt,
            ).format('YYYYMM'),
            madein: 'woocommerce',
            quotation: 1,
            operationType: 'C',
            company: _pCompany,
            branchOrigin: branchOrigin,
            branchDestination: branchDestination,
            depositOrigin: depositOrigin,
            depositDestination: depositDestination,
            wooId: _wTransaction.id,
            discountAmount: _wTransaction.discount_total,
            shipmentMethod: _pShipmentMethod,
            deliveryAddress: _pAddress,
          })
          _pTransaction = await new TransactionUC(
            this.database,
            this.authToken,
          ).saveTransaction(_pTransaction)

          try {
            if (_wTransaction.line_items && _wTransaction.line_items.length > 0) {
              for (let item of _wTransaction.line_items) {
                let articles: Article[] = await this._pLoadArticles({
                  wooId: item.product_id
                    ? item.product_id.toString()
                    : item.id.toString(),
                })

                if (articles.length === 0) {
                  throw new HttpException(
                    new Responser(
                      404,
                      null,
                      `El producto ${item.id} - ${item.name} no se encuentra asociado.`,
                      `El producto ${item.id} - ${item.name} no se encuentra asociado.`,
                    ),
                  )
                }
                let movementOfArticle: MovementOfArticle = await new MovementOfArticleUC(
                  this.database,
                ).createMovementOfArticle(
                  _pTransaction._id,
                  articles[0]._id,
                  item.quantity,
                  item.price,
                  true,
                  _pTransaction.depositDestination,
                )

                if (articles[0].containsStructure) {
                  let structures: Structure[] = await this.loadStructure(articles[0]._id)

                  structures.forEach(async (structure: Structure) => {
                    await new MovementOfArticleUC(this.database).createMovementOfArticle(
                      _pTransaction._id,
                      structure.child._id,
                      structure.quantity * item.quantity,
                      structure.increasePrice ? structure.increasePrice : 0,
                      false,
                      _pTransaction.depositDestination,
                      movementOfArticle,
                    )
                  })
                }
              }
            }

            _pTransaction.taxes = await new TransactionUC(this.database).recalculateTaxes(
              _pTransaction,
            )
            let movementOfCash: MovementOfCash = MovementOfCashSchema.getInstance(
              this.database,
            )
            let paymentMethod: PaymentMethod = await this.loadPaymentMethod()

            movementOfCash = Object.assign(movementOfCash, {
              date: _pTransaction.endDate,
              expirationDate: _pTransaction.endDate,
              type: paymentMethod,
              amountPaid: _pTransaction.totalPrice,
              transaction: _pTransaction,
            })

            movementOfCash = await new MovementOfCashController(
              this.database,
            ).saveMovementOfCash(movementOfCash)
            if (!paymentMethod.isCurrentAccount) {
              await new TransactionController(this.database).update(_pTransaction._id, {
                balance: 0,
              })
            }
          } catch (error) {
            await new TransactionUC(this.database).deleteTransaction(_pTransaction._id)
            throw error
          }
        }
      }

      response.send(new Responser(200, _wTransactions))
    } catch (error) {
      next(
        new HttpException(
          new Responser(
            error.status || 500,
            null,
            error.response && error.response.data
              ? error.response.data.message
              : error.message,
            error,
          ),
        ),
      )
    }
  }

  _wLoadTransactions(page: number = 1, per_page: number = 10): Promise<any[]> {
    return new Promise<any[]>(async (resolve, reject) => {
      try {
        await this.connect(this.database)
        let lastTransactionDate: string = `${moment('2021-01-01').format(
          'YYYY-MM-DD',
        )}T00:00:00`

        await new TransactionController(this.database)
          .getAll({
            match: {wooId: {$exists: true}, operationType: {$ne: 'D'}},
            sort: {wooId: -1},
          })
          .then((result: Responseable) => {
            if (result.result.length > 0)
              lastTransactionDate = `${moment(result.result[0].endDate).format(
                'YYYY-MM-DDTHH:mm:ss',
              )}`
          })
        const status: string = 'processing'
        const params: string = `after=${lastTransactionDate}&status=${status}&orderby=id&order=asc&page=${page}&per_page=${per_page}`

        await this.api.get(`orders?${params}`).then((response: any) => {
          resolve(response.data)
        })
      } catch (error) {
        reject(error)
      }
    })
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

  async _pLoadTransactions({
    project = {},
    match = {},
    sort = {},
    group = {},
    limit = 0,
    skip = 0,
  }): Promise<Transaction[]> {
    return new Promise<Transaction[]>(async (resolve, reject) => {
      try {
        await this.connect(this.database)

        match = {
          ...match,
          $or: [
            {
              'type.application': {$oid: this.application._id},
              operationType: {$ne: 'D'},
            },
            {
              wooId: {$exists: true, $ne: '0'},
              operationType: {$ne: 'D'},
            },
          ],
        }

        project = {
          ...project,
          _id: 1,
          'type._id': 1,
          'type.application': 1,
          wooId: 1,
          operationType: 1,
        }

        await new TransactionController(this.database)
          .getAll({
            project,
            match,
            group,
            sort,
            limit,
            skip,
          })
          .then((result: Responseable) => {
            if (result.status === 200) {
              resolve(result.result)
            } else reject(result)
          })
      } catch (error) {
        reject(error)
      }
    })
  }
  /* FIN TRANSACTIONS */

  /* STRUCTURE */
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
  /* FIN STRUCTURE */

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

  /* TRANSACTIONS TYPES */
  async _pLoadTransactionsTypes(match: {} = {}): Promise<TransactionType[]> {
    return new Promise<TransactionType[]>(async (resolve, reject) => {
      try {
        await this.connect(this.database)

        match = {
          ...match,
          $or: [
            {
              application: {$oid: this.application._id},
              operationType: {$ne: 'D'},
            },
            {
              wooId: {$exists: true, $ne: '0'},
              operationType: {$ne: 'D'},
            },
          ],
        }

        await new TransactionTypeController(this.database)
          .getAll({
            project: {
              _id: 1,
              application: 1,
              wooId: 1,
              operationType: 1,
              modifyStock: 1,
              stockMovement: 1,
              transactionMovement: 1,
              requestTaxes: 1,
            },
            match,
          })
          .then((result: Responseable) => {
            resolve(result.result)
          })
      } catch (error) {
        reject(error)
      }
    })
  }
  /* FIN TRANSACTION TYPES */

  /* COMPANY */
  _wLoadCompany(id: string): Promise<any> {
    return new Promise<any>(async (resolve, reject) => {
      try {
        await this.connect(this.database)
        this.api.get(`customers/${id}`).then((response: any) => {
          resolve(response.data)
        })
      } catch (error) {
        reject(error)
      }
    })
  }

  _pLoadCompanies(match: {} = {}): Promise<Company[]> {
    return new Promise<Company[]>((resolve, reject) => {
      new CompanyController(this.database)
        .getAll({
          project: {
            _id: 1,
            name: 1,
            emails: 1,
            wooId: 1,
            operationType: 1,
          },
          match,
        })
        .then((result: Responseable) => {
          resolve(result.result)
        })
        .catch((error: any) => reject(error))
    })
  }
  /* FIN COMPANIES */

  /* VAT CONDITIONS */
  _pLoadVatConditions(match: {} = {}): Promise<VATCondition[]> {
    return new Promise<VATCondition[]>((resolve, reject) => {
      new VATConditionController(this.database)
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
            resolve(result.result)
          } else reject(result)
        })
        .catch((error: any) => reject(error))
    })
  }
  /* FIN VAT CONDITIONS */

  /* SHIPMENT METHODS */
  _pLoadShipmentMethods(match: {} = {}) {
    return new Promise((resolve, reject) => {
      match = {
        ...match,
        $or: [
          {
            'applications._id': {$oid: this.application._id},
            operationType: {$ne: 'D'},
          },
          {
            wooId: {$exists: true, $ne: '0'},
            operationType: {$ne: 'D'},
          },
        ],
      }
      new ShipmentMethodController(this.database)
        .getAll({
          project: {
            _id: 1,
            name: 1,
            wooId: 1,
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
}

export interface wAttribute {
  id?: number
  name?: string
  position?: number
  visible?: boolean
  variation?: boolean
  options?: string[]
  option?: string
}

export interface WVariant {
  name: string
  option: string
}

export interface WOtherField {
  id?: number
  name: string
  options: string[]
  visible: boolean
  variation: boolean
}

export interface WTag {
  id?: number
  name: string
}

export interface Client {
  db: string
  serverURL?: string
  url: string
  consumerKey: string
  consumerSecret: string
}
