import {Schema} from 'mongoose'

import MongooseModel from './../../db/mongoose-model'
import Model from './../model/model'
class DepositSchema extends Model {
  public name: string = 'deposit'

  constructor() {
    super({
      name: {type: String, trim: true, required: true},
      capacity: {type: Number, defualt: 0},
      branch: {type: Schema.Types.ObjectId, ref: 'branch', required: true},
      default: {type: Boolean, default: false, required: true},
    })
  }

  public getPath(): string {
    return '/deposits'
  }

  public getInstance(database: string) {
    return new (new MongooseModel(this, database).getModel(this.name))()
  }
}

export default new DepositSchema()
