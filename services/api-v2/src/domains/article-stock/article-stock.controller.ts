import * as express from 'express'
import * as fs from 'fs'
import * as multer from 'multer'
import * as moment from 'moment'

import Controller from '../model/model.controller'

import ObjDto from './article-stock.dto'
import ObjSchema from './article-stock.model'


import HttpException from './../../exceptions/HttpException'
import RequestWithUser from './../../interfaces/requestWithUser.interface'
import Responseable from './../../interfaces/responsable.interface'
import authMiddleware from './../../middleware/auth.middleware'
import ensureLic from './../../middleware/license.middleware'
import validationMiddleware from './../../middleware/validation.middleware'
import Responser from './../../utils/responser'

export default class ArticleStockController extends Controller {
  public EJSON: any = require('bson').EJSON
  public path = ObjSchema.getPath()
  public router = express.Router()

  constructor(database: string) {
    super(ObjSchema, ObjDto, database)
    this.initializeRoutes()
  }

  private initializeRoutes() {
    let upload = multer({storage: this.getStorage()})

    this.router
      .get(this.path, [authMiddleware, ensureLic], this.getAllObjs)
      .get(`${this.path}/:id`, [authMiddleware, ensureLic], this.getObjById)
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
      
      .post(
        `${this.path}/update-excel`,
        [authMiddleware, ensureLic, upload.single('excel')],
        this.updateExcel,
      )
  }

  updateExcel = async (
    request: RequestWithUser,
    response: express.Response,
    next: express.NextFunction,
  ) => {
    try {
      this.initConnectionDB(request.database)
      this.userAudit = request.user

      response.send(new Responser(200, {}))
    } catch (error) {
      next(
        new HttpException(new Responser(error.status || 500, null, error.message, error)),
      )
    }
  }

  getStorage(): multer.StorageEngine {
    let storage = multer.diskStorage({
      destination: function (request: RequestWithUser, file, cb) {
        try {
			let path = '/home/clients/'

          if (request.database) {
            path += `${request.database}/excel`
          }
          fs.mkdirSync(path, {recursive: true})
          cb(null, path)
        } catch (err) {
          cb(err, null)
        }
      },
      filename: function (req, file, cb) {
        try {
          let name: string =
            moment().format('YYYY-MM-DD-THH_mm_ss').toString() +
            '-' +
            file.originalname.normalize('NFD').replace(/[\u0300-\u036f]/g, '.xlsx')

          cb(null, name.replace(/ /g, '-'))
        } catch (err) {
          cb(err, null)
        }
      },
    })

    return storage
  }
}
