import {Schema} from 'mongoose'

import MongooseModel from './../../db/mongoose-model'
import Model from './../model/model'

class MakeSchema extends Model {
  public name: string = 'make'

  constructor() {
    super({
      description: {type: String, trim: true, required: true},
      visibleSale: {type: Boolean, default: true},
      ecommerceEnabled: {type: Boolean, default: false},
      applications: [{type: Schema.Types.ObjectId, ref: 'application'}],
      picture: {type: String, trim: true, default: 'default.jpg', required: true},
    })
  }

  public getPath(): string {
    return '/makes'
  }

  public getInstance(database: string) {
    return new (new MongooseModel(this, database).getModel(this.name))()
  }
}

export default new MakeSchema()
