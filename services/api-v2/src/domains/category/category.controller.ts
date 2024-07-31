import * as express from 'express'

import Controller from '../model/model.controller'
import WooCommerceController from '../uc/woocomerce.controller'

import ArticleController from './../../domains/article/article.controller'
import MovementOfArticleController from './../../domains/movement-of-article/movement-of-article.controller'
import PriceListController from './../../domains/price-list/price-list.controller'
import HttpException from './../../exceptions/HttpException'
import RequestWithUser from './../../interfaces/requestWithUser.interface'
import Responseable from './../../interfaces/responsable.interface'
import authMiddleware from './../../middleware/auth.middleware'
import ensureLic from './../../middleware/license.middleware'
import validationMiddleware from './../../middleware/validation.middleware';
import Responser from './../../utils/responser'
import ObjDto from './category.dto'
import Category from './category.interface'
import ObjSchema from './category.model'

export default class CategoryController extends Controller {
  public EJSON: any = require('bson').EJSON
  public path = ObjSchema.getPath()
  public router = express.Router()
  public obj: any

  constructor(database: string) {
    super(ObjSchema, ObjDto, database)
    this.initializeRoutes()
  }

  private initializeRoutes() {
    this.router
      .get(this.path, [authMiddleware, ensureLic], this.getAllObjs)
      .get(`${this.path}/find`, [authMiddleware, ensureLic], [authMiddleware, ensureLic], this.getFindObj)
      .get(`${this.path}/:id`, [authMiddleware, ensureLic], this.getObjById)
      .post(`${this.path}/fullquery`, [authMiddleware, ensureLic], this.getFullQueryObjs)
      .post(
        this.path,
        [authMiddleware, ensureLic, validationMiddleware(ObjDto)],
        this.saveObj,
      )
      .put(
        `${this.path}/:id`,
        [authMiddleware, ensureLic, validationMiddleware(ObjDto)],
        this.updateObj,
      )
      .delete(`${this.path}/:id`, [authMiddleware, ensureLic], this.deleteCategory)
  }

  public saveObj = async (
    request: RequestWithUser,
    response: express.Response,
    next: express.NextFunction,
  ) => {
    this.initConnectionDB(request.database)
    let isValid: boolean = true

    this.userAudit = request.user
    const objData = request.body

    objData.creationUser = request.user

    if (isValid) {
      this.save(new this.model({...objData}))
        .then((result: Responseable) => {
          // SYNC WOO
          if (
            isValid &&
            result.result &&
            (result.result.ecommerceEnabled || result.result.wooId)
          ) {
            new WooCommerceController(request.database)
              .syncCategories(result.result._id)
              .then((result: Responseable) => {
                if (result.status === 200) {
                } else {
                }
              })
              .catch((error: Responseable) => {
                isValid = false
              })
          }
          response.send(result)
        })
        .catch((error: Responseable) => {
          isValid = false
          next(new HttpException(new Responser(500, null, error.message, error)))
        })
    }
  }

  public updateObj = async (
    request: RequestWithUser,
    response: express.Response,
    next: express.NextFunction,
  ) => {
    this.initConnectionDB(request.database)
    let isValid: boolean = true

    this.userAudit = request.user
    const id = request.params.id
    const objData: any = request.body

    if (isValid) {
      this.update(id, objData)
        .then((result: Responseable) => {
          // SYNC WOO
          if (
            isValid &&
            result.status === 200 &&
            result.result &&
            (result.result.ecommerceEnabled || result.result.wooId)
          ) {
            new WooCommerceController(request.database)
              .syncCategories(result.result._id)
              .then((result: Responseable) => {
                if (result.status === 200) {
                } else {
                }
              })
              .catch((error: Responseable) => {
                isValid = false
              })
          }
          response.send(result)
        })
        .catch((error: Responseable) =>
          next(new HttpException(new Responser(500, null, error.message, error))),
        )
    }
  }

  public deleteCategory = async (
    request: RequestWithUser,
    response: express.Response,
    next: express.NextFunction,
  ) => {
    this.initConnectionDB(request.database)
    let isValid: boolean = true

    this.userAudit = request.user
    const id = request.params.id

    if (isValid) {
      await new ArticleController(request.database)
        .getAll({match: {operationType: {$ne: 'D'}, category: {$oid: id}}})
        .then((result: Responseable) => {
          if (result.status === 200) {
            if (result.result.length > 0) {
              isValid = false
              next(
                new HttpException(
                  new Responser(
                    400,
                    null,
                    'No se puede eliminar la categoría, tiene productos asociados',
                    'No se puede eliminar la categoría, tiene productos asociados',
                  ),
                ),
              )
            }
          } else {
            isValid = false
            next(new HttpException(result))
          }
        })
        .catch((error: Responseable) => {
          isValid = false
          next(new HttpException(new Responser(500, null, error.message, error)))
        })
    }

    if (isValid) {
      await this.getAll({match: {operationType: {$ne: 'D'}, parent: {$oid: id}}})
        .then((result: Responseable) => {
          if (result.status === 200) {
            if (result.result.length > 0) {
              isValid = false
              next(
                new HttpException(
                  new Responser(
                    400,
                    null,
                    'No se puede eliminar la categoría, tiene categorías hijas',
                    'No se puede eliminar la categoría, tiene categorías hijas',
                  ),
                ),
              )
            }
          } else {
            isValid = false
            next(new HttpException(result))
          }
        })
        .catch((error: Responseable) => {
          isValid = false
          next(new HttpException(new Responser(500, null, error.message, error)))
        })
    }

    if (isValid) {
      await new MovementOfArticleController(request.database)
        .getAll({match: {operationType: {$ne: 'D'}, category: {$oid: id}}})
        .then((result: Responseable) => {
          if (result.status === 200) {
            if (result.result.length > 0) {
              isValid = false
              next(
                new HttpException(
                  new Responser(
                    400,
                    null,
                    'No se puede eliminar la categoría, tiene movimientos de productos asociados',
                    'No se puede eliminar la categoría, tiene movimientos de productos asociados',
                  ),
                ),
              )
            }
          } else {
            isValid = false
            next(new HttpException(result))
          }
        })
        .catch((error: Responseable) => {
          isValid = false
          next(new HttpException(new Responser(500, null, error.message, error)))
        })
    }

    if (isValid) {
      await new PriceListController(request.database)
        .getAll({match: {operationType: {$ne: 'D'}, 'rules.category': {$oid: id}}})
        .then((result: Responseable) => {
          if (result.status === 200) {
            if (result.result.length > 0) {
              isValid = false
              next(
                new HttpException(
                  new Responser(
                    400,
                    null,
                    'No se puede eliminar la categoría, tiene lista de precios asociadas',
                    'No se puede eliminar la categoría, tiene lista de precios asociadas',
                  ),
                ),
              )
            }
          } else {
            isValid = false
            next(new HttpException(result))
          }
        })
        .catch((error: Responseable) => {
          isValid = false
          next(new HttpException(new Responser(500, null, error.message, error)))
        })
    }

    let oldCategory: Category

    if (isValid) {
      await this.getAll({match: {_id: {$oid: id}}})
        .then((result: Responseable) => {
          if (result.status === 200) {
            if (result.result.length > 0) {
              oldCategory = result.result[0]
            } else {
              isValid = false
              next(
                new HttpException(
                  new Responser(400, null, 'data not found', 'data not found'),
                ),
              )
            }
          } else {
            isValid = false
            next(new HttpException(result))
          }
        })
        .catch((error: Responseable) => {
          isValid = false
          next(new HttpException(new Responser(500, null, error.message, error)))
        })
    }

    if (isValid) {
      this.delete(id)
        .then((result: Responseable) => {
          // SYNC WOO
          if (isValid && result.status === 200 && oldCategory && oldCategory.wooId) {
            new WooCommerceController(request.database)
              ._wDeleteCategory(oldCategory)
              .then((result: Responseable) => {
                if (result.status === 200) {
                } else {
                  isValid = false
                }
              })
              .catch((error: Responseable) => {
                isValid = false
              })
          }
          response.send(result)
        })
        .catch((error: Responseable) => {
          isValid = false
          next(new HttpException(new Responser(500, null, error.message, error)))
        })
    }
  }
}
