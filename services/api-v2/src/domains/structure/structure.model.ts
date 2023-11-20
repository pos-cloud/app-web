import {Schema} from 'mongoose'

import MongooseModel from './../../db/mongoose-model'
import Model from './../model/model'

class StructureSchema extends Model {
  public name: string = 'structure'

  constructor() {
    super({
      parent: {type: Schema.Types.ObjectId, ref: 'article', required: true},
      child: {type: Schema.Types.ObjectId, ref: 'article', required: true},
      quantity: {type: Number, default: 0, required: true},
      utilization: {
        type: String,
        trim: true,
        required: true,
        enum: ['Venta', 'Produccion'],
      },
      increasePrice: {type: Number, default: 0},
      optional: {type: Boolean, default: false},
    })
  }

  public getPath(): string {
    return '/structures'
  }

  public getInstance(database: string) {
    return new (new MongooseModel(this, database).getModel(this.name))()
  }
}

export default new StructureSchema()
