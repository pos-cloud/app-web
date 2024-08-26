import * as express from 'express'

import Controller from '../model/model.controller'

import HttpException from './../../exceptions/HttpException'
import RequestWithUser from './../../interfaces/requestWithUser.interface'
import authMiddleware from './../../middleware/auth.middleware'
import ensureLic from './../../middleware/license.middleware'
import validationMiddleware from './../../middleware/validation.middleware'
import Responser from './../../utils/responser'
import TransactionCreateDto from './transaction-create.dto'
import ObjDto from './transaction.dto'
import Transaction from './transaction.interface'
import ObjSchema from './transaction.model'
import TransactionUC from './transaction.uc'
import User from '../user/user.interface'

export default class TransactionController extends Controller {
  public EJSON: any = require('bson').EJSON
  public path = ObjSchema.getPath()
  public router = express.Router()
  public obj: any
  public userAudit: User

  constructor(database: string, userAudit?:User) {
    super(ObjSchema, ObjDto, database)
    this.initializeRoutes()
    this.userAudit = userAudit;
  }

  private initializeRoutes() {
    this.router
      .get(this.path, [authMiddleware, ensureLic], this.getAllObjs)
      .get(`${this.path}/:id`, [authMiddleware, ensureLic], this.getObjById)
      .post(`${this.path}/fullquery`, [authMiddleware, ensureLic], this.getFullQueryObjs)
      .post(
        `${this.path}/validate-electronic/:id`,
        [authMiddleware, ensureLic],
        this.validateElectronicTransaction,
      )
      .post(
        `${this.path}/create`,
        [authMiddleware, ensureLic, validationMiddleware(TransactionCreateDto)],
        this.createTransaction,
      )
      .post(
        this.path,
        [authMiddleware, ensureLic, validationMiddleware(ObjDto)],
        this.saveObj,
      )
      .put(
        `${this.path}/update-balance/:id`,
        [authMiddleware, ensureLic],
        this.updateBalance,
      )
      .put(
        `${this.path}/:id`,
        [authMiddleware, ensureLic, validationMiddleware(ObjDto)],
        this.updateObj,
      )
      .delete(`${this.path}/:id`, [authMiddleware, ensureLic], this.deleteObj)
      .delete(`${this.path}`, [authMiddleware, ensureLic], this.deleteObjs)
  }

  saveObj = async (
    request: RequestWithUser,
    response: express.Response,
    next: express.NextFunction,
  ) => {
    try {
      this.initConnectionDB(request.database)
      this.userAudit = request.user
      
      let objData: Transaction = await new TransactionUC(
        request.database,
        request.headers.authorization,
        this.userAudit,
      ).saveTransaction(request.body)

      response.send(new Responser(200, objData))
    } catch (error) {
      console.log(error)
      next(
        new HttpException(new Responser(error.status || 500, null, error.message, error)),
      )
    }
  }

  updateObj = async (
    request: RequestWithUser,
    response: express.Response,
    next: express.NextFunction,
  ) => {
    try {
      this.initConnectionDB(request.database)
      this.userAudit = request.user
      const id = request.params.id
      const transaction: Transaction = await new TransactionUC(
        request.database,
        request.headers.authorization,
      ).updateTransaction(id, request.body)

      response.send(new Responser(200, transaction))
    } catch (error) {
      next(
        new HttpException(new Responser(error.status || 500, null, error.message, error)),
      )
    }
  }

  deleteObj = async (
    request: RequestWithUser,
    response: express.Response,
    next: express.NextFunction,
  ) => {
    try {
      this.initConnectionDB(request.database)
      this.userAudit = request.user
      const id = request.params.id
      const transaction = await new TransactionUC(
        request.database,
        request.headers.authorization,
      ).deleteTransaction(id)

      response.send(new Responser(200, transaction))
    } catch (error) {
      next(
        new HttpException(new Responser(error.status || 500, null, error.message, error)),
      )
    }
  }

  updateBalance = async (
    request: RequestWithUser,
    response: express.Response,
    next: express.NextFunction,
  ) => {
    try {
      this.initConnectionDB(request.database)
      this.userAudit = request.user
      const balance: number = await new TransactionUC(
        request.database,
        request.headers.authorization,
      ).updateBalance(request.params.id)

      response.send(new Responser(200, {balance}))
    } catch (error) {
      next(
        new HttpException(new Responser(error.status || 500, null, error.message, error)),
      )
    }
  }

  validateElectronicTransaction = async (
    request: RequestWithUser,
    response: express.Response,
    next: express.NextFunction,
  ) => {
    try {
      this.initConnectionDB(request.database)
      this.userAudit = request.user
      const transaction: Transaction = await new TransactionUC(
        request.database,
        request.headers.authorization,
      ).validateElectronicTransaction(
        request.params.id,
        request.body.canceledTransactions,
      )

      response.send(new Responser(200, transaction))
    } catch (error) {
      next(
        new HttpException(new Responser(500, null, error.message, error)),
      )
    }
  }

  createTransaction = async (
    request: RequestWithUser,
    response: express.Response,
    next: express.NextFunction,
  ) => {
    try {
      this.initConnectionDB(request.database)
      this.userAudit = request.user
      const result = await new TransactionUC(
        request.database,
        request.headers.authorization,
      ).createTransaction(
        request.body.transaction,
        request.body.movementsOfCashes,
        request.body.movementsOfArticles,
        request.user,
      )

      response.send(new Responser(200, result))
    } catch (error) {
      console.log(error)
      next(
        new HttpException(new Responser(error.status || 500, null, error.message, error)),
      )
    }
  }
}
