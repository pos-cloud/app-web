import {Schema} from 'mongoose'

import MongooseModel from './../../db/mongoose-model'
import Model from './../model/model'

class BankSchema extends Model {
  public name: string = 'bank'

  constructor() {
    super({
      code: {type: Number, default: 0, required: true},
      agency: {type: Number},
      account: {type: Schema.Types.ObjectId, ref: 'account'},
      name: {type: String, trim: true, required: true},
    })
  }

  public getPath(): string {
    return '/banks'
  }

  public getInstance(database: string) {
    return new (new MongooseModel(this, database).getModel(this.name))()
  }
}

export default new BankSchema()
