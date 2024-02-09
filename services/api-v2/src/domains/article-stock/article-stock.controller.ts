import * as express from 'express'
import * as fs from 'fs'
import * as multer from 'multer'
import * as moment from 'moment'
import * as xlsx from 'xlsx';

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
import ArticleStockUC from './article-stock.uc';

export default class ArticleStockController extends Controller {
  public EJSON: any = require('bson').EJSON
  public path = ObjSchema.getPath()
  public router = express.Router()

  constructor(database: string) {
    super(ObjSchema, ObjDto, database)
    this.initializeRoutes()
  }

  private initializeRoutes() {
    const upload = multer({ dest: 'uploads/' });

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
        [authMiddleware, ensureLic, upload.single('file')],
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
      
      const file = request.file;
      const branchId = request.body.branchId;
      const depositId = request.body.depositId
      if (!file) {
        throw new Error('No se ha proporcionado ningún archivo.');
      }

      const workbook = xlsx.readFile(file.path);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      const data = xlsx.utils.sheet_to_json(worksheet);

      
      const res = await new ArticleStockUC(request.database).updateFromExcel(data, branchId, depositId)


      response.send(new Responser(200, res))
    } catch (error) {
      next(
        new HttpException(new Responser(error.status || 500, null, error.message, error)),
      )
    }
  }
}
