import {Schema} from 'mongoose'

import MongooseModel from './../../db/mongoose-model'
import Model from './../model/model'

class TableSchema extends Model {
  public name: string = 'table'

  constructor() {
    super({
      description: {type: String, trim: true, required: true},
      room: {type: Schema.Types.ObjectId, ref: 'room', required: true},
      chair: {type: Number, default: 0, required: true},
      diners: {type: Number, default: 0},
      state: {type: String, trim: true, required: true},
      employee: {type: Schema.Types.ObjectId, ref: 'employee', required: true},
      lastTransaction: {type: Schema.Types.ObjectId, ref: 'transaction'},
    })
  }

  public getPath(): string {
    return '/tables'
  }

  public getInstance(database: string) {
    return new (new MongooseModel(this, database).getModel(this.name))()
  }
}

export default new TableSchema()
