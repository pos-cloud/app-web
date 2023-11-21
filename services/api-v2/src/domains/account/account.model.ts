import {Schema} from 'mongoose'

import MongooseModel from './../../db/mongoose-model'
import Model from './../model/model'

class AccountSchema extends Model {
  public name: string = 'account'

  constructor() {
    super({
      code: {type: String, trim: true},
      description: {type: String, trim: true, required: true},
      type: {
        type: String,
        trim: true,
        enum: [
          'Activo',
          'Pasivo',
          'Patrimonio Neto',
          'Resultado',
          'Compensatoria',
          'Otro',
        ],
      },
      mode: {type: String, trim: true, enum: ['Sintetico', 'Analitico']},
      parent: {type: Schema.Types.ObjectId, ref: 'account'},
    })
  }

  public getPath(): string {
    return '/accounts'
  }

  public getInstance(database: string) {
    return new (new MongooseModel(this, database).getModel(this.name))()
  }
}

export default new AccountSchema()
