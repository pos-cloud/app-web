import {Schema} from 'mongoose'

import MongooseModel from './../../db/mongoose-model'
import Model from './../model/model'

class CategorySchema extends Model {
  public name: string = 'category'

  constructor() {
    super({
      order: {type: Number, default: 1, required: true},
      description: {type: String, trim: true, required: true},
      picture: {type: String, trim: true, default: 'default.jpg', required: true},
      visibleInvoice: {type: Boolean, default: false},
      visibleOnSale: {type: Boolean, default: true},
      visibleOnPurchase: {type: Boolean, default: true},
      ecommerceEnabled: {type: Boolean, default: false},
      favourite: {type: Boolean, default: false},
      applications: [{type: Schema.Types.ObjectId, ref: 'application'}],
      isRequiredOptional: {type: Boolean, default: false},
      parent: {type: Schema.Types.ObjectId, ref: 'category'},
      observation: {type: String, trim: true},
      wooId: {type: String},
      showMenu: {type: Boolean, default: false},
    })
  }

  public getPath(): string {
    return '/categories'
  }

  public getInstance(database: string) {
    return new (new MongooseModel(this, database).getModel(this.name))()
  }
}

export default new CategorySchema()
