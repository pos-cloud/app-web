import {Schema} from 'mongoose'

import MongooseModel from './../../db/mongoose-model'
import Model from './../model/model'

class MovementOfCashBoxSchema extends Model {
  public name: string = 'movements-of-cash-box'

  constructor() {
    super({
      opening: {type: Date, required: true},
      closing: {type: Date, required: true},
      paymentMethod: {type: Schema.Types.ObjectId, ref: 'payment-method', required: true},
      cashBox: {type: Schema.Types.ObjectId, ref: 'cash-box', required: true},
    })
  }

  public getPath(): string {
    return '/movements-of-cash-boxs'
  }

  public getInstance(database: string) {
    return new (new MongooseModel(this, database).getModel(this.name))()
  }
}

export default new MovementOfCashBoxSchema()
