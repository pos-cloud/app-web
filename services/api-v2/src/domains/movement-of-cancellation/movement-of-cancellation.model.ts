import {Schema} from 'mongoose'

import MongooseModel from './../../db/mongoose-model'
import Model from './../model/model'

class MovementOfCancellationSchema extends Model {
  public name: string = 'movements-of-cancellation'

  constructor() {
    super({
      transactionOrigin: {
        type: Schema.Types.ObjectId,
        ref: 'transaction',
        required: true,
      },
      transactionDestination: {
        type: Schema.Types.ObjectId,
        ref: 'transaction',
        required: true,
      },
      balance: {type: Number, default: 0, required: true},
      type: {type: Schema.Types.ObjectId, ref: 'cancellation-type'},
    })
  }

  public getPath(): string {
    return '/movements-of-cancellations'
  }

  public getInstance(database: string) {
    return new (new MongooseModel(this, database).getModel(this.name))()
  }
}

export default new MovementOfCancellationSchema()
