import * as express from 'express'

import Controller from '../model/model.controller'

import ConnectionController from './../../db/connection'
import MongooseModel from './../../db/mongoose-model'
import HttpException from './../../exceptions/HttpException'
import RequestWithUser from './../../interfaces/requestWithUser.interface'
import Responseable from './../../interfaces/responsable.interface'
import authMiddleware from './../../middleware/auth.middleware'
import Responser from './../../utils/responser'
import ObjDto from './history.dto'
import History from './history.interface'
import ObjSchema from './history.model'

export default class HistoryController extends Controller {
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
      .get(this.path, [authMiddleware], this.getAllObjs)
      .post(`${this.path}/recover/:id`, [authMiddleware], this.recoverDoc)
  }

  public recoverDoc = async (
    request: RequestWithUser,
    response: express.Response,
    next: express.NextFunction,
  ) => {
    this.initConnectionDB(request.database)
    this.userAudit = request.user
    const id = request.params.id

    this.getById(id)
      .then(async (result: Responseable) => {
        if (result.status === 200 && result.result) {
          let historyDoc: History = result.result
          let modelHistoryDoc = new MongooseModel(
            this.ObjSchema,
            request.database,
          ).getModel(this.ObjSchema.name)
          let objData = historyDoc.doc
          let modelObjData = new MongooseModel(
            new ConnectionController().getSchema(
              request.database,
              historyDoc.collectionName,
            ),
            request.database,
          ).getModel(historyDoc.collectionName)

          await this.saveMany(modelObjData, [objData])
            .then(async (result: Responseable) =>
              result.status == 200 && result.result
                ? await this.deleteDocuments(modelHistoryDoc, [historyDoc])
                    .then((result: Responseable) =>
                      result.status == 200 && result.result
                        ? response.send(result)
                        : next(result),
                    )
                    .catch((error: Responseable) => next(error))
                : next(result),
            )
            .catch((error: Responseable) => next(error))
        } else {
          next(
            new HttpException(new Responser(404, null, 'no data found', 'no data found')),
          )
        }
      })
      .catch((error: Responseable) =>
        next(new HttpException(new Responser(500, null, error.message, error))),
      )
  }
}
