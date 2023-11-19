import {Schema} from 'mongoose'

import MongooseModel from './../../db/mongoose-model'
import Model from './../model/model'

class PriceListSchema extends Model {
  public name: string = 'price-list'

  constructor() {
    super({
      name: {type: String, trim: true, required: true},
      percentage: {type: Number, default: 0},
      default: {type: Boolean, default: false},
      allowSpecialRules: {type: Boolean, default: false, required: true},
      rules: [
        {
          category: {type: Schema.Types.ObjectId, ref: 'category'},
          make: {type: Schema.Types.ObjectId, ref: 'make'},
          percentage: {type: Number, default: 0},
        },
      ],
      exceptions: [
        {
          article: {type: Schema.Types.ObjectId, ref: 'article'},
          percentage: {type: Number, default: 0},
        },
      ],
    })
  }

  public getPath(): string {
    return '/price-lists'
  }

  public getInstance(database: string) {
    return new (new MongooseModel(this, database).getModel(this.name))()
  }
}

export default new PriceListSchema()
