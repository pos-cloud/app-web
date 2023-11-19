import {Schema} from 'mongoose'

import MongooseModel from '../../db/mongoose-model'
import Model from '../model/model'

class AccountSeatSchema extends Model {
  public name: string = 'account-seat'

  constructor() {
    super({
      date: {type: Date},
      observation: {type: String, trim: true},
      transaction: {type: Schema.Types.ObjectId, ref: 'transaction'},
      period: {type: Schema.Types.ObjectId, ref: 'account-period'},
      items: [
        {
          account: {type: Schema.Types.ObjectId, ref: 'account'},
          debit: {type: Number, default: 0},
          credit: {type: Number, default: 0},
        },
      ],
    })
  }

  public getPath(): string {
    return '/account-seats'
  }

  public getInstance(database: string) {
    return new (new MongooseModel(this, database).getModel(this.name))()
  }
}

export default new AccountSeatSchema()
