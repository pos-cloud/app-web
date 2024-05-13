import * as fs from 'fs'

import * as express from 'express'
import * as moment from 'moment'
import * as multer from 'multer'
import * as xlsx from 'xlsx';

import CategoryController from '../../domains/category/category.controller'
import Category from '../../domains/category/category.interface'
import categoryModel from '../../domains/category/category.model'
import CompanyController from '../../domains/company/company.controller'
import MakeController from '../../domains/make/make.controller'
import Make from '../../domains/make/make.interface'
import makeModel from '../../domains/make/make.model'
import TaxController from '../../domains/tax/tax.controller'
import UnitOfMeasurementController from '../../domains/unit-of-measurement/unit-of-measurement.controller'
import User from '../../domains/user/user.interface'
import userModel from '../../domains/user/user.model'
import Controller from '../model/model.controller'

import HttpException from './../../exceptions/HttpException'
import RequestWithUser from './../../interfaces/requestWithUser.interface'
import Responseable from './../../interfaces/responsable.interface'
import authMiddleware from './../../middleware/auth.middleware'
import ensureLic from './../../middleware/license.middleware'
import validationMiddleware from './../../middleware/validation.middleware'
import Responser from './../../utils/responser'
import ObjDto from './article.dto'
import Article from './article.interface'
import ObjSchema from './article.model'
import ArticleUC from './article.uc'
import axios from 'axios';

export default class ArticleController extends Controller {
  public EJSON: any = require('bson').EJSON
  public path = ObjSchema.getPath()
  public router = express.Router()
  public obj: any
  public authToken: string;

  constructor(database: string) {
    super(ObjSchema, ObjDto, database)
    this.initializeRoutes()
  }

  private initializeRoutes() {
    let upload = multer({ storage: this.getStorage() })

    this.router      
      .get(this.path, this.getAllObjs)
      .get(`${this.path}/articles-tiendanube`, [authMiddleware, ensureLic], this.importTiendaNube) 
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
      .delete(`${this.path}/:id`, [authMiddleware, ensureLic], this.deleteArticle)
      .post(
        `${this.path}/import-excel`,
        [authMiddleware, ensureLic, upload.single('file')],
        this.updateExcel,
      )
      .post(
        `${this.path}/update-by-structure`,
        [authMiddleware, ensureLic],
        this.updateCostByStruct,
      )
      .post(
        `${this.path}/update-price-by-query`,
        [authMiddleware, ensureLic],
        this.updatePricebyQuery,
      )
      .post(`${this.path}/update-prices`, [authMiddleware, ensureLic], this.updatePrices)
  }

  getStorage(): multer.StorageEngine {
    let storage = multer.diskStorage({
      destination: function (request: RequestWithUser, file, cb) {
        try {
          let path = '/home/clients/'

          if (request.database) {
            path += `${request.database}/excel`
          }
          fs.mkdirSync(path, { recursive: true })
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

  updateCostByStruct = async (
    request: RequestWithUser,
    response: express.Response,
    next: express.NextFunction,
  ) => {
    try {
      this.initConnectionDB(request.database)
      this.userAudit = request.user
      const result = await new ArticleUC(
        request.database,
        request.headers.authorization,
      ).updateCostByStruct()

      response.send(new Responser(200, result))
    } catch (error) {
      next(
        new HttpException(new Responser(error.status || 500, null, error.message, error)),
      )
    }
  }

  updatePrices = async (
    request: RequestWithUser,
    response: express.Response,
    next: express.NextFunction,
  ) => {
    try {
      this.initConnectionDB(request.database)
      this.userAudit = request.user

      const result = await new ArticleUC(
        request.database,
        request.headers.authorization,
      ).recalculatePrices(
        request.body.articlesCode,
        request.body.field,
        request.body.decimal,
        request.body.percentage,
      )

      response.send(new Responser(200, result))
    } catch (error) {
      next(
        new HttpException(new Responser(error.status || 500, null, error.message, error)),
      )
    }
  }

  updatePricebyQuery = async (
    request: RequestWithUser,
    response: express.Response,
    next: express.NextFunction,
  ) => {
    this.initConnectionDB(request.database)
    this.userAudit = request.user

    const make = request.body.make
    const category = request.body.category
    const articlesCode: string[] = []

    let match: any = {}

    if (make) match['make'] = { $oid: make }
    if (category) match['category'] = { $oid: category }
    match['operationType'] = { $ne: 'D' }

    await new ArticleController(request.database)
      .getAll({
        project: {
          code: 1,
          operationType: 1,
          make: 1,
          category: 1,
        },
        match: match,
      })
      .then(
        async (result) => {
          if (result.status === 200) {
            result.result.forEach(async (element: Article) => {
              articlesCode.push(element.code)
            })

            const resultPrice = await new ArticleUC(
              request.database,
              request.headers.authorization,
            ).recalculatePrices(
              articlesCode,
              request.body.field,
              request.body.decimal,
              request.body.percentage,
            )

            response.send(new Responser(200, resultPrice))
          } else {
            new HttpException(
              new Responser(result.status, null, result.message, result.error),
            )
          }
        },
        (error) => {
          new HttpException(
            new Responser(error.status || 500, null, error.message, error),
          )
        },
      )
  }

  deleteArticle = async (
    request: RequestWithUser,
    response: express.Response,
    next: express.NextFunction,
  ) => {
    try {
      this.initConnectionDB(request.database)
      this.userAudit = request.user
      const id = request.params.id

      await new ArticleUC(request.database, request.headers.authorization).deleteArticle(id)

      response.send(new Responser(200))
    } catch (error) {
      next(
        new HttpException(new Responser(error.status || 500, null, error.message, error)),
      )
    }
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
      if (!file) {
        throw new Error('No se ha proporcionado ningún archivo.');
      }

      const workbook = xlsx.readFile(file.path);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      //   const data = xlsx.utils.sheet_to_json(worksheet);
      const range = xlsx.utils.decode_range(worksheet['!ref']);
      const data = [];

      for (let rowNum = range.s.r + 1; rowNum <= range.e.r; rowNum++) {
        let hasData = false;
        const rowData: any = {};
        for (let colNum = range.s.c; colNum <= range.e.c; colNum++) {
          const cellAddress = xlsx.utils.encode_cell({ r: rowNum, c: colNum });
          const cell = worksheet[cellAddress];
          const value = cell && cell.v !== undefined ? String(cell.v) : '';
          rowData[`column${colNum + 1}`] = value;
          if (value.trim() !== '') {
            hasData = true;
          }
        }
        if (hasData) {
          data.push(rowData);
        }
      }

      const res = await new ArticleUC(request.database).importFromExcel(data)

       response.send(new Responser(200, res))
    } catch (error) {
      console.log(error)
      next(
        new HttpException(new Responser(error.status || 500, null, error.message, error)),
      )
    }
  }

  importTiendaNube = async (
    request: RequestWithUser,
    response: express.Response,
    next: express.NextFunction) => {
    try {
      this.initConnectionDB(request.database);
      this.userAudit = request.user;
      this.authToken = request.headers.authorization;

      const data = await this.getArticlesTn();
      if (!data.length) {
        return response.send(new Responser(404, null, 'No hay artículos en Tienda Nube para sincronizar', null));
      }

      const res = await new ArticleUC(request.database).importProductTiendaNube(data)

      return response.send(new Responser(200, data));
    } catch (error) {
      next(
        new HttpException(new Responser(error.status || 500, null, error.message, error)),
      )
    }
  }

  async getArticlesTn() {
    const URL = 'http://localhost:305/products';
    const articles = [];
    let page = 1;
  
    const requestOptions = {
      headers: {
        Authorization: this.authToken
      }
    };
  
      while (true) {
        const response = await axios.get(URL,{
          data: { page },
          ...requestOptions
        });
        const responseData = response.data;
        articles.push(...responseData);

        if (responseData.length < 200) {
          break; 
        }
        page++;
      }
      return articles;
  }  
}
