import * as mongoose from 'mongoose'

import ConnectionController from './connection'

class MongooseModel {
  private schema: mongoose.Schema
  private database: string

  constructor(schema: mongoose.Schema, database: string) {
    this.schema = schema
    this.database = database
  }

  public getModel(name: string): any {
    const connection = new ConnectionController().createConnection(this.database)

    if (!connection) {
      throw new Error('Connection error')
    }
    const model = connection.model(name, this.schema)

    return model
  }

  public objectIdIsValid(id: string) {
    return mongoose.Types.ObjectId.isValid(id)
  }
}

export default MongooseModel
