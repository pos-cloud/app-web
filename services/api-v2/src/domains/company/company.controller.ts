import * as express from 'express'
import * as xlsx from 'xlsx';
import * as multer from 'multer'
import * as moment from 'moment';

import Controller from '../model/model.controller'

import TransactionController from './../../domains/transaction/transaction.controller'
import UserController from './../../domains/user/user.controller'
import HttpException from './../../exceptions/HttpException'
import RequestWithUser from './../../interfaces/requestWithUser.interface'
import Responseable from './../../interfaces/responsable.interface'
import authMiddleware from './../../middleware/auth.middleware'
import ensureLic from './../../middleware/license.middleware'
import validationMiddleware from './../../middleware/validation.middleware'
import Responser from './../../utils/responser'
import ObjDto from './company.dto'
import ObjSchema from './company.model'
import CompanyUc from './company.uc';

export default class CompanyController extends Controller {
  public EJSON: any = require('bson').EJSON
  public path = ObjSchema.getPath()
  public router = express.Router()
  public obj: any

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
      .put(`${this.path}/:id`, [authMiddleware, ensureLic], this.updateObj)
      .delete(`${this.path}/:id`, [authMiddleware, ensureLic], this.deleteCompany)
      .post(
        `${this.path}/import-excel`,
        [authMiddleware, ensureLic, upload.single('file')],
        this.updateExcel,
      )
  }

  public deleteCompany = async (
    request: RequestWithUser,
    response: express.Response,
    next: express.NextFunction,
  ) => {
    this.initConnectionDB(request.database)
    this.userAudit = request.user
    const id = request.params.id

    new TransactionController(request.database)
      .getAll({match: {operationType: {$ne: 'D'}, company: {$oid: id}}})
      .then((result: Responseable) => {
        if (result.status === 200) {
          result.result.length > 0
            ? next(
                new HttpException(
                  new Responser(
                    400,
                    null,
                    'No se puede eliminar la empresa, tiene transacciones asociadas',
                    'No se puede eliminar la empresa, tiene transacciones asociadas',
                  ),
                ),
              )
            : new UserController(request.database)
                .getAll({match: {operationType: {$ne: 'D'}, company: {$oid: id}}})
                .then((result: Responseable) => {
                  if (result.status === 200) {
                    result.result.length > 0
                      ? next(
                          new HttpException(
                            new Responser(
                              400,
                              null,
                              'No se puede eliminar la empresa, tiene usuarios asociados',
                              'No se puede eliminar la empresa, tiene usuarios asociados',
                            ),
                          ),
                        )
                      : this.deleteObj(request, response, next)
                  } else next(new HttpException(result))
                })
                .catch((error: Responseable) =>
                  next(new HttpException(new Responser(500, null, error.message, error))),
                )
        } else next(new HttpException(result))
      })
      .catch((error: Responseable) =>
        next(new HttpException(new Responser(500, null, error.message, error))),
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
      if (!file) {
        throw new Error('No se ha proporcionado ningún archivo.');
      }

      const workbook = xlsx.readFile(file.path);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      const range = xlsx.utils.decode_range(worksheet['!ref']);
   
      const data2 = [];

      for (let rowNum = range.s.r + 1; rowNum <= range.e.r; rowNum++) {
        const rowData:any = {};
        for (let colNum = range.s.c; colNum <= range.e.c; colNum++) {
          const cellAddress = xlsx.utils.encode_cell({ r: rowNum, c: colNum });
          const cell = worksheet[cellAddress];
          const value = cell ? String(cell.v) : '';
          rowData[`column${colNum + 1}`] = value;
        }
        data2.push(rowData);
      }

      const res = await new CompanyUc(request.database).importFromExcel(data2)

      response.send(new Responser(200, res))
    } catch (error) {
      console.log(error)
      next(
        new HttpException(new Responser(error.status || 500, null, error.message, error)),
      )
    }
  }
}
