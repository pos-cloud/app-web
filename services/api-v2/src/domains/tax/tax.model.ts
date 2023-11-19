import {Schema} from 'mongoose'

import MongooseModel from './../../db/mongoose-model'
import Model from './../model/model'

class TaxSchema extends Model {
  public name: string = 'tax'

  constructor() {
    super({
      code: {type: String, trim: true, default: '0', required: true},
      name: {type: String, trim: true, required: true},
      taxBase: {type: String, trim: true, required: true},
      percentage: {type: Number, default: 0, required: true},
      amount: {type: Number, default: 0},
      classification: {type: String, trim: true, required: true},
      type: {type: String, trim: true, required: true},
      lastNumber: {type: Number, default: 0},
      debitAccount: {type: Schema.Types.ObjectId, ref: 'account'},
      creditAccount: {type: Schema.Types.ObjectId, ref: 'account'},
    })
  }

  public getPath(): string {
    return '/taxes'
  }

  public getInstance(database: string) {
    return new (new MongooseModel(this, database).getModel(this.name))()
  }
}

export default new TaxSchema()
