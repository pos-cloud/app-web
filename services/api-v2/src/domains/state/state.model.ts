import {Schema} from 'mongoose'

import MongooseModel from './../../db/mongoose-model'
import Model from './../model/model'

class StateSchema extends Model {
  public name: string = 'state'

  constructor() {
    super({
      code: {type: String, trim: true, required: true},
      name: {type: String, trim: true, required: true},
      country: {type: Schema.Types.ObjectId, ref: 'country', required: true},
    })
  }

  public getPath(): string {
    return '/states'
  }

  public getInstance(database: string) {
    return new (new MongooseModel(this, database).getModel(this.name))()
  }
}

export default new StateSchema()
