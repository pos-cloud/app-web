import {spawn} from 'child_process'

import * as express from 'express'

import RequestWithUser from '../../interfaces/requestWithUser.interface'
import Controller from '../model/model.controller'

import authMiddleware from './../../middleware/auth.middleware'
import ensureLic from './../../middleware/license.middleware'
import validationMiddleware from './../../middleware/validation.middleware'
import ObjDto from './config.dto'
import ObjSchema from './config.model'
export default class ConfigController extends Controller {
  public EJSON: any = require('bson').EJSON
  public path = ObjSchema.getPath()
  public router = express.Router()
  public obj: any
  public database: string;

  constructor(database: string) {
    super(ObjSchema, ObjDto, database)
    this.initializeRoutes()
  }

  private initializeRoutes() {
    this.router
      .get(this.path, [authMiddleware, ensureLic], this.getAllObjs)
      .get(`${this.path}/generateBackUp`, [authMiddleware, ensureLic], this.backUp)
      .get(`${this.path}/downloadBD/:filename`, this.downloadBD)
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
  }

  public downloadBD = (request: RequestWithUser, response: express.Response)=> {
    const dbName = this.database
    //let dbName = request.params.filename.split('-', 1)[0]
   let route = `/home/clients/${dbName}/backups/${request.params.filename}`

    return response.download(route)
  }

  public backUp = (request: RequestWithUser, response: express.Response) =>{
    let today = new Date()
    const dd = String(today.getDate()).padStart(2, '0')
    const mm = String(today.getMonth() + 1).padStart(2, '0') //January is 0!
    const yyyy = today.getFullYear()
    const todayString = dd + '-' + mm + '-' + yyyy
    this.database = request.database
    const dbName = request.database

    let archive_path = `/home/clients/${dbName}/backups/${dbName + '-' + todayString}.gz`
    
    const child = spawn('mongodump', [
      `--db=${dbName}`,
      `--archive=${archive_path}`,
      `--gzip`,
    ])

    child.stdout.on('data', (data) => {})
    child.stderr.on('data', (data) => {})
    child.on('error', (e) => { })

    child.on('exit', (code, signal) => {
      if (code) {
        return response.send({
          archive_path: `${dbName + '-' + todayString}.gz`,
          message: 'Process exit with code: ' + code,
          status: 200,
        })
      } else if (signal) {
        return response.send({
          archive_path: `${dbName + '-' + todayString}.gz`,
          message: 'Process killed with signal:',
          signal,
          status: 200,
        })
      } else {
        return response.send({
          archive_path: `${dbName + '-' + todayString}.gz`,
          message: 'Backup is successfull',
          status: 200,
        })
      }
    })
  }
}
