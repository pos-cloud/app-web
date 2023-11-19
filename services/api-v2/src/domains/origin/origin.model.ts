import {Schema} from 'mongoose'

import MongooseModel from './../../db/mongoose-model'
import Model from './../model/model'

class OriginSchema extends Model {
  public name: string = 'origin'

  constructor() {
    super({
      number: {type: Number, default: 0, require: true},
      branch: {type: Schema.Types.ObjectId, ref: 'branch', required: true},
    })
  }

  public getPath(): string {
    return '/origins'
  }

  public getInstance(database: string) {
    return new (new MongooseModel(this, database).getModel(this.name))()
  }
}

export default new OriginSchema()
