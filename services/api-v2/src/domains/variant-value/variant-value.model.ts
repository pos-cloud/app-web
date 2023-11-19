import {Schema} from 'mongoose'

import MongooseModel from './../../db/mongoose-model'
import Model from './../model/model'

class VariantValueSchema extends Model {
  public name: string = 'variant-value'

  constructor() {
    super({
      type: {type: Schema.Types.ObjectId, ref: 'variant-type', required: true},
      order: {type: Number, default: 1, required: true},
      description: {type: String, trim: true, required: true},
      picture: {type: String, trim: true, default: 'default.jpg'},
    })
  }

  public getPath(): string {
    return '/variant-values'
  }

  public getInstance(database: string) {
    return new (new MongooseModel(this, database).getModel(this.name))()
  }
}

export default new VariantValueSchema()
