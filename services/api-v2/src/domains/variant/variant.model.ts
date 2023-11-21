import {Schema} from 'mongoose'

import MongooseModel from './../../db/mongoose-model'
import Model from './../model/model'

class VariantSchema extends Model {
  public name: string = 'variant'

  constructor() {
    super({
      type: {type: Schema.Types.ObjectId, ref: 'variant-type', required: true},
      value: {type: Schema.Types.ObjectId, ref: 'variant-value', required: true},
      articleParent: {type: Schema.Types.ObjectId, ref: 'article', required: true},
      articleChild: {type: Schema.Types.ObjectId, ref: 'article', required: true},
    })
  }

  public getPath(): string {
    return '/variants'
  }

  public getInstance(database: string) {
    return new (new MongooseModel(this, database).getModel(this.name))()
  }
}

export default new VariantSchema()
