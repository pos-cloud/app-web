import {Schema} from 'mongoose'

import MongooseModel from './../../db/mongoose-model'
import Model from './../model/model'

class CashBoxSchema extends Model {
  public name: string = 'cash-box-'

  constructor() {
    super({
      number: {type: Number, default: 0, required: true},
      openingDate: {type: Date, required: true},
      closingDate: {type: Date},
      state: {type: String, trim: true, required: true, enum: ['Abierta', 'Cerrada']},
      employee: {type: Schema.Types.ObjectId, ref: 'employee', required: true},
      type: {type: Schema.Types.ObjectId, ref: 'cash-box-type'},
    })
  }

  public getPath(): string {
    return '/cash-boxes'
  }

  public getInstance(database: string) {
    return new (new MongooseModel(this, database).getModel(this.name))()
  }
}

export default new CashBoxSchema()
