import * as express from 'express'

import 'moment/locale/es'
import Controller from '../model/model.controller'

import RequestWithUser from './../../interfaces/requestWithUser.interface'
import authMiddleware from './../../middleware/auth.middleware'
import ensureLic from './../../middleware/license.middleware'
import validationMiddleware from './../../middleware/validation.middleware'
import ObjDto from './transaction-type.dto'
import {TransactionType} from './transaction-type.interface'
import ObjSchema from './transaction-type.model'

export default class TransactionTypeController extends Controller {
  public EJSON: any = require('bson').EJSON
  public cron: any = require('node-schedule')
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
      .post(
        this.path,
        [authMiddleware, ensureLic, validationMiddleware(ObjDto)],
        this.saveTransactionType,
      )
      .put(
        `${this.path}/:id`,
        [authMiddleware, ensureLic, validationMiddleware(ObjDto)],
        this.updateTransactionType,
      )
      .delete(`${this.path}/:id`, [authMiddleware, ensureLic], this.deleteObj)
  }

  public saveTransactionType = async (
    request: RequestWithUser,
    response: express.Response,
    next: express.NextFunction,
  ) => {
    this.initConnectionDB(request.database)
    this.userAudit = request.user
    const objData = request.body

    if (objData.resetOrderNumber && objData.resetOrderNumber === 'Tiempo') {
      this.startPaymentVerificationTask(objData)
    }
    this.saveObj(request, response, next)
  }

  public updateTransactionType = async (
    request: RequestWithUser,
    response: express.Response,
    next: express.NextFunction,
  ) => {
    this.initConnectionDB(request.database)
    this.userAudit = request.user
    const objData = request.body

    if (objData.resetOrderNumber && objData.resetOrderNumber === 'Tiempo') {
      this.startPaymentVerificationTask(objData)
      /* verificasr el campo de tiempo si viene vacio matar el proceso
			let my_job = this.cron.scheduledJobs[objData._id];
			if(my_job){
				my_job.cancel();
			}
			*/
    }
    this.updateObj(request, response, next)
  }

  public startPaymentVerificationTask(transactionType: TransactionType) {
    let scheduleJob = this.cron.scheduleJob
    let time = transactionType.resetOrderNumber.split(' ') // 10 * * * * *
    let job = scheduleJob(
      transactionType._id,
      `${time[0]} ${time[1]} ${time[2]} ${time[3]} ${time[4]} ${time[5]}`,
      () => {
        this.update(transactionType._id, {orderNumber: 0})
      },
      null,
      true,
    )
  }
}
