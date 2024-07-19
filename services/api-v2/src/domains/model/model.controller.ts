import {plainToClass} from 'class-transformer'
import {validate, ValidationError} from 'class-validator'
import User from 'domains/user/user.interface'
import * as express from 'express'
import * as moment from 'moment'
import 'moment/locale/es'
import * as mongoose from 'mongoose'

import MongooseModel from '../../db/mongoose-model'
import HttpException from '../../exceptions/HttpException'
import NotFoundException from '../../exceptions/NotFoundException'
import RequestWithUser from '../../interfaces/requestWithUser.interface'
import Responser from '../../utils/responser'

import ConnectionController from './../../db/connection'
import History from './../../domains/history/history.interface'
import PropertyValueExistsException from './../../exceptions/PropertyValueExistsException'
import Responseable from './../../interfaces/responsable.interface'
import HistorySchema from './../history/history.model'

export default class Controller {
  EJSON: any = require('bson').EJSON
  model: any
  ObjSchema: any
  ObjDto: any
  database: string
  userAudit: User

  constructor(ObjSchema: any, ObjDto: any, database: string, userAudit?:User) {
    this.ObjSchema = ObjSchema
    this.ObjDto = ObjDto
    if (database) this.initConnectionDB(database)
    this.userAudit = userAudit;
  }

  initConnectionDB(database: string) {
    this.database = database
    if (!this.database) {
      throw new Error('Debe definir la base de datos')
    }
    const mongooseModel = new MongooseModel(this.ObjSchema, database)

    if (!mongooseModel) {
      throw new Error('Error al crear el modelo')
    }
    this.model = mongooseModel.getModel(this.ObjSchema.name)
  }

  roundNumber(value: any, numberOfDecimals: number = 2): any {
    if (value) {
      if (!isNaN(value)) {
        switch (numberOfDecimals) {
          case 0:
            return Math.round(value * 1) / 1
          case 1:
            return Math.round(value * 10) / 10
          case 2:
            return Math.round(value * 100) / 100
          case 3:
            return Math.round(value * 1000) / 1000
          case 4:
            return Math.round(value * 10000) / 10000
          case 5:
            return Math.round(value * 100000) / 100000
          case 6:
            return Math.round(value * 1000000) / 1000000
          default:
            return Math.round(value * 100) / 100
        }
      } else {
        return parseFloat(value.toFixed(numberOfDecimals))
      }
    } else {
      if (value === 0) {
        return 0
      }
    }
  }

  // GET ALL
  getAll({
    project = {},
    match = {},
    sort = {},
    group = {},
    limit = 0,
    skip = 0,
  }): Promise<Responseable> {
    return new Promise<Responseable>((resolve, reject) => {
      let queryAggregate: any = []

      if (Object.keys(project).length > 0) {
        this.getLookups(queryAggregate, project)

        if (Object.keys(sort).length > 0) queryAggregate.push({$sort: sort})

        queryAggregate.push({$project: project})
      } else {
        if (Object.keys(sort).length > 0) queryAggregate.push({$sort: sort})
      }

      if (Object.keys(match).length > 0) queryAggregate.push({$match: match})
      if (Object.keys(group).length > 0) queryAggregate.push({$group: group})

      if (limit > 0) {
        if (Object.keys(group).length > 0) {
          let projectGroup = `{ "items": { "$slice": ["$items", ${skip}, ${limit}] }`

          for (const prop of Object.keys(group)) {
            if (prop !== 'items') {
              projectGroup += `, "${prop}": 1`
            }
          }
          projectGroup += '}'
          queryAggregate.push({$project: JSON.parse(projectGroup)})
        } else {
          queryAggregate.push({$limit: limit})
          queryAggregate.push({$skip: skip})
        }
      }

      queryAggregate = this.EJSON.parse(JSON.stringify(queryAggregate))

      if (queryAggregate.length === 0) queryAggregate.push({$limit: 10})
      // console.log(JSON.stringify(queryAggregate));
      this.model
        .aggregate(queryAggregate)
        .allowDiskUse(true)
        .then((result: Responseable) => resolve(new Responser(200, result)))
        .catch((error: any) => reject(error))
    })
  }

  getLookups(queryAggregate: any, project: {}): [] {
    let ctrl: ConnectionController = new ConnectionController()
    // RELACIÓN PRIMER NIVEL
    let schemaLvl1 = this.ObjSchema

    if (schemaLvl1 && schemaLvl1.paths) {
      for (let keyLvl1 of Object.keys(schemaLvl1.paths)) {
        if (
          schemaLvl1.paths[keyLvl1].instance === 'ObjectID' &&
          schemaLvl1.paths[keyLvl1].options.ref
        ) {
          // BUSCAMOS RELACIÓN UNO A UNO
          if (
            this.searchPropertyOfArray(project, `${keyLvl1}.`) ||
            this.searchPropertyOfArray(project, `${keyLvl1}_`)
          ) {
            queryAggregate.push({
              $lookup: {
                from: ctrl
                  .getConnection(this.database)
                  .base._pluralize(schemaLvl1.paths[keyLvl1].options.ref),
                foreignField: '_id',
                localField: keyLvl1,
                as: keyLvl1,
              },
            })
            queryAggregate.push({
              $unwind: {path: `$${keyLvl1}`, preserveNullAndEmptyArrays: true},
            })
            // RELACIÓN SIGUIENTE NIVEL
            this.getNextLvl(
              queryAggregate,
              project,
              schemaLvl1,
              schemaLvl1.paths[keyLvl1].options.ref,
              keyLvl1,
              keyLvl1,
            )
          }
        } else if (
          schemaLvl1.paths[keyLvl1].instance === 'Array' &&
          schemaLvl1.paths[keyLvl1].schemaOptions.id &&
          schemaLvl1.paths[keyLvl1].options.type[0].ref
        ) {
          // BUSCAMOS ARRAY DE ID
          if (
            this.searchPropertyOfArray(project, `${keyLvl1}.`) ||
            this.searchPropertyOfArray(project, `${keyLvl1}_`)
          ) {
            queryAggregate.push({
              $lookup: {
                from: ctrl
                  .getConnection(this.database)
                  .base._pluralize(schemaLvl1.paths[keyLvl1].options.type[0].ref),
                foreignField: '_id',
                localField: keyLvl1,
                as: keyLvl1,
              },
            })
            // RELACIÓN SIGUIENTE NIVEL
            this.getNextLvl(
              queryAggregate,
              project,
              schemaLvl1,
              schemaLvl1.paths[keyLvl1].options.type[0].ref,
              keyLvl1,
              keyLvl1,
            )
          }
        } else if (
          schemaLvl1.paths[keyLvl1].instance === 'Array' &&
          !schemaLvl1.paths[keyLvl1].schemaOptions.id
        ) {
          // BUSCAMOS OBJETO DENTRO DEL ARRAY
          for (let attr of Object.keys(schemaLvl1.paths[keyLvl1].options.type[0])) {
            if (schemaLvl1.paths[keyLvl1].options.type[0][attr].ref) {
              if (
                this.searchPropertyOfArray(project, `${keyLvl1}.${attr}.`) ||
                this.searchPropertyOfArray(project, `${keyLvl1}.${attr}_`)
              ) {
                queryAggregate.push({
                  $lookup: {
                    from: ctrl
                      .getConnection(this.database)
                      .base._pluralize(
                        schemaLvl1.paths[keyLvl1].options.type[0][attr].ref,
                      ),
                    foreignField: '_id',
                    localField: `${keyLvl1}.${attr}`,
                    as: `${keyLvl1}.${attr}`,
                  },
                })
                // RELACIÓN SIGUIENTE NIVEL
                this.getNextLvl(
                  queryAggregate,
                  project,
                  schemaLvl1,
                  schemaLvl1.paths[keyLvl1].options.type[0][attr].ref,
                  keyLvl1,
                  keyLvl1,
                )
              }
            }
          }
        }
      }
    }

    return
  }

  getNextLvl(
    queryAggregate: any,
    project: {},
    schemaLastLvl: any,
    ref: string,
    lastKey: string,
    keyNew: string,
  ): [] {
    let ctrl: ConnectionController = new ConnectionController()
    let countRelations: number = 0

    if (schemaLastLvl.paths[keyNew]) {
      let schemaLvl = ctrl.getSchema(this.database, ref)

      if (schemaLvl && schemaLvl.paths) {
        for (let key of Object.keys(schemaLvl.paths)) {
          if (
            schemaLvl.paths[key].instance === 'ObjectID' &&
            schemaLvl.paths[key].options.ref
          ) {
            if (this.searchPropertyOfArray(project, `${lastKey}.${key}.`)) {
              queryAggregate.push({
                $lookup: {
                  from: ctrl
                    .getConnection(this.database)
                    .base._pluralize(schemaLvl.paths[key].options.ref),
                  foreignField: '_id',
                  localField: `${lastKey}.${key}`,
                  as: `${lastKey}.${key}`,
                },
              })
              queryAggregate.push({
                $unwind: {
                  path: `$${`${lastKey}.${key}`}`,
                  preserveNullAndEmptyArrays: true,
                },
              })

              // RELACIÓN SIGUIENTE NIVEL
              countRelations++
              this.getNextLvl(
                queryAggregate,
                project,
                schemaLvl,
                schemaLvl.paths[key].options.ref,
                `${lastKey}.${key}`,
                key,
              )
            }
          } else if (
            schemaLvl.paths[key].instance === 'Array' &&
            schemaLvl.paths[key].schemaOptions.id &&
            schemaLvl.paths[key].options.type[0].ref
          ) {
            // BUSCAMOS ARRAY DE ID
            if (
              this.searchPropertyOfArray(project, `${lastKey}.${key}.`) ||
              this.searchPropertyOfArray(project, `${lastKey}.${key}_`)
            ) {
              queryAggregate.push({
                $lookup: {
                  from: ctrl
                    .getConnection(this.database)
                    .base._pluralize(schemaLvl.paths[key].options.type[0].ref),
                  foreignField: '_id',
                  localField: `${lastKey}.${key}`,
                  as: `${lastKey}.${key}`,
                },
              })

              // RELACIÓN SIGUIENTE NIVEL
              countRelations++
              this.getNextLvl(
                queryAggregate,
                project,
                schemaLvl,
                schemaLvl.paths[key].options.ref,
                `${lastKey}.${key}`,
                key,
              )
            }
          } else if (
            schemaLvl.paths[key].instance === 'Array' &&
            !schemaLvl.paths[key].schemaOptions.id
          ) {
            // BUSCAMOS OBJETO DENTRO DEL ARRAY
            for (let attr of Object.keys(schemaLvl.paths[`${key}`].options.type[0])) {
              if (schemaLvl.paths[`${key}`].options.type[0][attr].ref) {
                if (
                  this.searchPropertyOfArray(project, `${lastKey}.${key}.${attr}.`) ||
                  this.searchPropertyOfArray(project, `${lastKey}.${key}.${attr}_`)
                ) {
                  queryAggregate.push({
                    $lookup: {
                      from: ctrl
                        .getConnection(this.database)
                        .base._pluralize(
                          schemaLvl.paths[`${key}`].options.type[0][attr].ref,
                        ),
                      foreignField: '_id',
                      localField: `${lastKey}.${key}.${attr}`,
                      as: `${lastKey}.${key}.${attr}`,
                    },
                  })

                  // RELACIÓN SIGUIENTE NIVEL
                  countRelations++
                  this.getNextLvl(
                    queryAggregate,
                    project,
                    schemaLvl,
                    schemaLvl.paths[key].options.ref,
                    `${lastKey}.${key}`,
                    key,
                  )
                }
              }
            }
          }
        }
      }
    }
    if (countRelations === 0) {
      return
    }
  }

  getFullQueryObjs = async (
    request: RequestWithUser,
    response: express.Response,
    next: express.NextFunction,
  ) => {
    this.initConnectionDB(request.database)
    this.userAudit = request.user
    this.getFullQuery(request.body)
      .then((result: Responseable) => response.send(result))
      .catch((error: any) =>
        next(new HttpException(new Responser(500, null, error.message, error))),
      )
  }

  getFullQuery(query: any): Promise<{result: any}> {
    return new Promise<{result: any}>((resolve, reject) => {
      let queryAggregate = this.EJSON.parse(JSON.stringify(query))

      this.model
        .aggregate(queryAggregate)
        .allowDiskUse(true)
        .then((result: Responseable) => resolve(new Responser(200, result)))
        .catch((error: any) => reject(error))
    })
  }

  getAllObjs = async (
    request: RequestWithUser,
    response: express.Response,
    next: express.NextFunction,
  ) => {
    this.initConnectionDB(request.database)
    this.userAudit = request.user

    let error
    let project = {}
    let match = {}
    let sort = {}
    let group = {}
    let limit = 0
    let skip = 0

    if (request.query) {
      if (request.query.project) {
        try {
          project = JSON.parse(request.query.project as string)
        } catch (error) {
          error = error
        }
      }
      if (request.query.match) {
        try {
          match = JSON.parse(request.query.match as string)
        } catch (error) {
          error = error
        }
      }
      if (request.query.sort) {
        try {
          sort = JSON.parse(request.query.sort as string)
        } catch (error) {
          error = error
        }
      }
      if (request.query.group) {
        try {
          group = JSON.parse(request.query.group as string)
        } catch (error) {
          error = error
        }
      }
      if (request.query.limit) {
        try {
          limit = parseInt(request.query.limit as string, 10)
        } catch (error) {
          error = error
        }
      }
      if (request.query.skip) {
        try {
          skip = parseInt(request.query.skip as string, 10)
        } catch (error) {
          error = error
        }
      }
    }

    if (!error) {
      this.getAll({project, match, sort, group, limit, skip})
        .then((result: Responseable) => response.send(result))
        .catch((error: any) => {
          // NO BORRAR! NECESITO MAS LOGS.
          console.log('database', this.database)
          console.log(request.headers.host)
          console.log(request.headers.origin)
          console.log('model', request.query)
          next(new HttpException(new Responser(500, null, error.message, error)))
        })
    } else {
      next(new HttpException(new Responser(500, error)))
    }
  }

  searchPropertyOfArray(json: {}, value: string): boolean {
    let n = false

    for (const a of Object.keys(json)) {
      if (!n) n = a.includes(value)
    }

    return n
  }

  // GET
  async getById(id: string): Promise<Responseable> {
    return new Promise<Responseable>(async (resolve, reject) => {
      if (mongoose.Types.ObjectId.isValid(id)) {
        this.model
          .findById(id)
          .then((result: Responseable) => {
            resolve(new Responser(200, result))
          })
          .catch((error: any) => reject(new NotFoundException(id, error)))
      } else {
        reject(new NotFoundException(id))
      }
    })
  }

  async find(query: {}, project: {}): Promise<[]> {
    return new Promise<[]>(async (resolve, reject) => {
        this.model
          .find(query,project)
          .then((result : []) => {
            resolve(result)
          })
          .catch((error: any) =>{ 
            console.log(error)
            reject(new NotFoundException('', error))})
    })
  }

  getFindObj = async (
    request: RequestWithUser,
    response: express.Response,
    next: express.NextFunction,
  ) =>{
    this.initConnectionDB(request.database)
    this.userAudit = request.user
    const {project, query} : any = request.query
    
    this.find(JSON.parse(query), JSON.parse(project))
      .then((result: any) => response.json(result))
      .catch((error: any) =>
        next(new HttpException(new Responser(500, null, error.message, error))),
      )

  }

  getObjById = async (
    request: RequestWithUser,
    response: express.Response,
    next: express.NextFunction,
  ) => {
    this.initConnectionDB(request.database)
    this.userAudit = request.user
    const id = request.params.id

    this.getById(id)
      .then((result: Responseable) => response.send(result))
      .catch((error: any) =>
        next(new HttpException(new Responser(500, null, error.message, error))),
      )
  }

  // SAVE
  async save(objData: any): Promise<Responseable> {
    return new Promise<Responseable>(async (resolve, reject) => {
      try {
        objData._id = new mongoose.Types.ObjectId()
        if (Object.keys(objData).length > 0) {
          Object.keys(objData).map((key: string) => {
            if (typeof objData[key] === 'number') {
              objData[key] = this.roundTo(objData[key], 2)
            }
          })
        }
        objData.isNew = true
		if(this.userAudit && this.userAudit._id){
			objData.creationUser = this.userAudit._id;
		}
        objData.creationDate = moment().format('YYYY-MM-DDTHH:mm:ssZ')
        objData.operationType = 'C'
        if (!objData.audits) objData.audits = new Array()
        if (this.userAudit) {
          objData.updateUser = this.userAudit
          objData.audits = [
            {
              date: moment().format('YYYY-MM-DDTHH:mm:ssZ'),
              user: this.userAudit._id,
            },
          ]
        }
        await this.validateDuplicateKeys(objData)
        await this.validateDto(objData)
        const result = await objData.save()
        
        resolve(new Responser(200, result))
      } catch (error) {
        reject(error)
      }
    })
  }

  async saveMany(collection: any, objsData: any[]): Promise<Responseable> {
    return new Promise<Responseable>(async (resolve, reject) => {
      const bulkWrites: any[] = []

      await objsData.forEach((document) => {
        bulkWrites.push({insertOne: {document}})
      })
      if (bulkWrites.length)
        await collection
          .bulkWrite(bulkWrites, {ordered: false})
          .then(async (result: any) =>
            result.ok == 1 && result.nInserted == objsData.length
              ? resolve(new Responser(200, result))
              : reject(
                  new HttpException(
                    new Responser(500, null, 'no data found', 'no data found'),
                  ),
                ),
          )
          .catch((error: any) =>
            reject(new HttpException(new Responser(500, null, error.message, error))),
          )
      else
        reject(
          new HttpException(new Responser(500, null, 'no data found', 'no data found')),
        )
    })
  }

  saveObj = async (
    request: RequestWithUser,
    response: express.Response,
    next: express.NextFunction,
  ) => {
    try {
      this.initConnectionDB(request.database)
      this.userAudit = request.user
      const objData = request.body
      const result = await this.save(new this.model({...objData}))

      response.send(result)
    } catch (error) {
      next(
        new HttpException(new Responser(error.status || 500, null, error.message, error)),
      )
    }
  }

  saveObjs = async (
    request: RequestWithUser,
    response: express.Response,
    next: express.NextFunction,
  ) => {
    try {
      this.initConnectionDB(request.database)
      this.userAudit = request.user
      const objsData = request.body

      for (const objData of objsData) {
        if (this.userAudit) {
          objData.audits = [
            {
              date: moment().format('YYYY-MM-DDTHH:mm:ssZ'),
              user: this.userAudit,
            },
          ]
        }
      }
      const result = await this.saveMany(this.model, objsData)

      response.send(result)
    } catch (error) {
      next(
        new HttpException(new Responser(error.status || 500, null, error.message, error)),
      )
    }
  }

  // UPDATE
  async update(id: string, objData: any): Promise<Responseable> {
    objData.updateDate = moment().format('YYYY-MM-DDTHH:mm:ssZ')
    objData.operationType = 'U'
    if (!objData._id) objData._id = id
    if (!objData.audits) objData.audits = new Array()
    if (this.userAudit) {
      objData.updateUser = this.userAudit
      objData.audits.push({
        date: moment().format('YYYY-MM-DDTHH:mm:ssZ'),
        user: this.userAudit,
      })
    }
    await this.validateDuplicateKeys(objData)
    await this.validateDto(objData, true)
    objData._id = id
    const result = await this.model.findByIdAndUpdate(id, objData, {new: true})

    return new Responser(200, result)
  }

  async updateMany(
    where: {},
    objData: any,
    options: {} = {upsert: false},
  ): Promise<Responseable> {
    return this.model.updateMany(
      this.EJSON.parse(JSON.stringify(where)),
      objData,
      options,
    )
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
      const objData: any = request.body
      const result = await this.update(id, objData)

      response.send(result)
    } catch (error) {
      next(
        new HttpException(new Responser(error.status || 500, null, error.message, error)),
      )
    }
  }

  updateObjs = async (
    request: RequestWithUser,
    response: express.Response,
    next: express.NextFunction,
  ) => {
    try {
      this.initConnectionDB(request.database)
      this.userAudit = request.user
      const where: {} = request.query.where
      const objData: any = request.body
      const result = await this.updateMany(where, objData)

      response.send(result)
    } catch (error) {
      next(
        new HttpException(new Responser(error.status || 500, null, error.message, error)),
      )
    }
  }

  // DELETE
  async delete(id: string) {
    return new Promise<Responseable>(async (resolve, reject) => {
      await this.deleteMany({_id: {$oid: id}})
        .then((result: Responseable) => resolve(result))
        .catch((error: any) => reject(error))
    })
  }

  async deleteMany(where: {}): Promise<Responseable> {
    return new Promise<Responseable>(async (resolve, reject) => {
      await this.moveDocuments(
        this.model,
        new MongooseModel(HistorySchema, this.database).getModel(HistorySchema.name),
        where,
      )
        .then((result: Responseable) =>
          result.status == 200 && result.result ? resolve(result) : reject(result),
        )
        .catch((error: any) => reject(error))
    })
  }

  deleteObj = async (
    request: RequestWithUser,
    response: express.Response,
    next: express.NextFunction,
  ) => {
    this.initConnectionDB(request.database)
    this.userAudit = request.user
    const id = request.params.id

    this.delete(id)
      .then((result: Responseable) => response.send(result))
      .catch((error: any) =>
        next(new HttpException(new Responser(500, null, error.message, error))),
      )
  }

  deleteObjs = async (
    request: RequestWithUser,
    response: express.Response,
    next: express.NextFunction,
  ) => {
    try {
      this.initConnectionDB(request.database)
      this.userAudit = request.user
      let where = request.query.where as string

      where = JSON.parse(where)
      const result = await this.deleteMany(where)

      response.send(result)
    } catch (error) {
      next(
        new HttpException(new Responser(error.status || 500, null, error.message, error)),
      )
    }
  }

  async deleteDocuments(collection: any, documents: any[]) {
    return new Promise(async (resolve, reject) => {
      const bulkWrites: any[] = []

      await documents.forEach(({_id}) => {
        bulkWrites.push({deleteOne: {filter: {_id}}})
      })
      if (bulkWrites.length)
        await collection
          .bulkWrite(bulkWrites, {ordered: false})
          .then(async (result: any) =>
            result.ok == 1 && result.nRemoved == documents.length
              ? resolve(new Responser(200, result))
              : reject(
                  new HttpException(
                    new Responser(500, null, 'no data found', 'no data found'),
                  ),
                ),
          )
          .catch((error: any) => reject(error))
      else
        reject(
          new HttpException(new Responser(500, null, 'no data found', 'no data found')),
        )
    })
  }

  // MOVE
  async moveDocuments(sourceCollection: any, targetCollection: any, match: {}) {
    return new Promise(async (resolve, reject) => {
      await this.getAll({match: match})
        .then(async (result: Responseable) => {
          if (result.status === 200 && result.result.length > 0) {
            let sourceDocs: History[] = new Array()
            let originalDocs = result.result

            for (const r of result.result) {
              let doc: History = HistorySchema.getInstance(this.database)

              doc.collectionName = this.ObjSchema.name
              doc.doc = r
              doc.audits = [
                {
                  date: moment().format('YYYY-MM-DDTHH:mm:ssZ'),
                  user: this.userAudit,
                },
              ]
              sourceDocs.push(doc)
            }
            await this.saveMany(targetCollection, sourceDocs)
              .then(async (result: Responseable) =>
                result.status == 200 && result.result
                  ? await this.deleteDocuments(sourceCollection, originalDocs)
                      .then((result: Responseable) =>
                        result.status == 200 && result.result
                          ? resolve(result)
                          : reject(result),
                      )
                      .catch((error: any) => reject(error))
                  : reject(result),
              )
              .catch((error: any) => reject(error))
          } else {
            resolve(new Responser(200, []))
          }
        })
        .catch((error: any) => reject(error))
    })
  }

  // VALIDATORS
  async validateDuplicateKeys(objData: any) {
    return new Promise(async (resolve, reject) => {
      for (let key of Object.keys(this.ObjSchema.paths)) {
        if (this.ObjSchema.paths[key].options['unique']) {
          let match: {}

          this.ObjSchema.paths[key].instance === 'String'
            ? (match = JSON.parse(
                `{ "_id": { "$ne": { "$oid": "${objData._id}" } }, "${key}":"${objData[key]}" }`,
              ))
            : (match = JSON.parse(
                `{ "_id": { "$ne": { "$oid": "${objData._id}" } }, "${key}":${objData[key]} }`,
              ))
          await this.getAll({match, limit: 1}).then(async (result: Responseable) => {
            if (result.status === 200 && result.result.length > 0) {
              reject(new PropertyValueExistsException(key, objData[key]))
            }
          })
        }
      }
      resolve(new Responser(200, true))
    })
  }

  validateDto(dataObj: any, skipMissingProperties: boolean = false) {
    return new Promise((resolve, reject) => {
      validate(plainToClass(this.ObjDto, JSON.parse(JSON.stringify(dataObj))), {
        skipMissingProperties: skipMissingProperties,
      }).then((errors: ValidationError[]) => {
        if (errors.length > 0) {
          const message = errors
            .map((error: ValidationError) => Object.values(error.constraints))
            .join(', ')

          resolve(true)
        } else {
          resolve(true)
        }
      })
    })
  }

  roundTo(value: number, places: number) {
    let power = Math.pow(10, places)

    return Math.round(value * power) / power
  }
}
