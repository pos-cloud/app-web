import * as express from 'express'

import ArticleController from '../../domains/article/article.controller'
import ArticleStockController from '../../domains/article-stock/article-stock.controller'
import MovementOfArticleController from '../../domains/movement-of-article/movement-of-article.controller'
import MovementOfCancellationController from '../../domains/movement-of-cancellation/movement-of-cancellation.controller'
import MovementOfCashController from '../../domains/movement-of-cash/movement-of-cash.controller'
import TransactionController from '../../domains/transaction/transaction.controller'
import HttpException from '../../exceptions/HttpException'
import RequestWithUser from '../../interfaces/requestWithUser.interface'
import Responser from '../../utils/responser'
import Controller from '../model/model.controller'

import Responseable from './../../interfaces/responsable.interface'
import authMiddleware from './../../middleware/auth.middleware'
import ensureLic from './../../middleware/license.middleware'
import validationMiddleware from './../../middleware/validation.middleware'
import ObjDto from './report.dto'
import ObjSchema from './report.model'

export default class ReportController extends Controller {
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
      .get(`${this.path}/:id`, [authMiddleware, ensureLic], this.getObjById)
      .get(`${this.path}-view/:name`, [authMiddleware, ensureLic], this.generateReport)
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
      .delete(`${this.path}/:id`, [authMiddleware, ensureLic], this.deleteObj)
  }

  public generateReport = async (
    request: RequestWithUser,
    response: express.Response,
    next: express.NextFunction,
  ) => {
    this.initConnectionDB(request.database)
    const database = request.database
    const paramsUser = request.query

    if (request.params.name) {
      this.getAll({
        project: {
          name: 1,
          query: 1,
          table: 1,
          params: 1,
        },
        match: {
          name: request.params.name,
        },
        limit: 1,
      }).then(
        (result: Responseable) => {
          if (result.status === 200) {
            let query = result.result[0].query.replace(/[^\x20-\x7E]/gim, '')
            let table = result.result[0].table
            let params = result.result[0].params

            if (params && params.length > 0 && paramsUser) {
              for (const iterator of params) {
                if (paramsUser[iterator.name]) {
                  query = query.replace('$' + iterator.name, paramsUser[iterator.name])
                }
              }
            }

            try {
              query = JSON.parse(query)
            } catch (error) {
              new HttpException(
                new Responser(
                  500,
                  null,
                  'La query es incorrecta',
                  'La query es incorrecta',
                ),
              )
            }

            if (table === 'Transaction') {
              new TransactionController(database)
                .getFullQuery(query)
                .then((result: Responseable) => response.send(result))
                .catch((error: Responseable) =>
                  next(new HttpException(new Responser(500, null, error.message, error))),
                )
            } else if (table === 'Movement-Of-Cash') {
              new MovementOfCashController(database)
                .getFullQuery(query)
                .then((result: Responseable) => response.send(result))
                .catch((error: Responseable) =>
                  next(new HttpException(new Responser(500, null, error.message, error))),
                )
            } else if (table === 'Stock') {
              new ArticleStockController(database)
                .getFullQuery(query)
                .then((result: Responseable) => response.send(result))
                .catch((error: Responseable) =>
                  next(new HttpException(new Responser(500, null, error.message, error))),
                )
            } else if (table === 'Movimiento de Producto') {
              new MovementOfArticleController(database)
                .getFullQuery(query)
                .then((result: Responseable) => response.send(result))
                .catch((error: Responseable) =>
                  next(new HttpException(new Responser(500, null, error.message, error))),
                )
            } else if (table === 'Movimiento de Cancelacion') {
              new MovementOfCancellationController(database)
                .getFullQuery(query)
                .then((result: Responseable) => response.send(result))
                .catch((error: Responseable) =>
                  next(new HttpException(new Responser(500, null, error.message, error))),
                )
            } else if (table === 'Producto') {
              new ArticleController(database)
                .getFullQuery(query)
                .then((result: Responseable) => response.send(result))
                .catch((error: Responseable) =>
                  next(new HttpException(new Responser(500, null, error.message, error))),
                )
            }
          } else {
            new Responser(500, null, result.message, result.message)
          }
        },
        (error) => {
          new Responser(500, null, error.message, error)
        },
      )
    } else {
      new Responser(
        500,
        null,
        'Parametros del endpoint incorrectos',
        'Parametros del endpoint incorrectos',
      )
    }
  }
}
