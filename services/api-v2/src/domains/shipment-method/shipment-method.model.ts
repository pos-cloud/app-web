import {Schema} from 'mongoose'

import MongooseModel from './../../db/mongoose-model'
import Model from './../model/model'

class ShipmentMethodSchema extends Model {
  public name: string = 'shipment-method'

  constructor() {
    super({
      name: {type: String, trim: true, require: true, unique: true},
      applications: [{type: Schema.Types.ObjectId, ref: 'application'}],
      article: {type: Schema.Types.ObjectId, ref: 'article'},
      requireAddress: {type: Boolean, default: true},
      requireTable: {type: Boolean, default: false},
      zones: [
        {
          name: {
            type: String,
            trim: true,
          },
          cost: {
            type: Number,
            trim: true,
          },
          type: {
            type: String,
            trim: true,
            enum: ['in', 'out'],
          },
          points: [
            {
              lat: {type: Number},
              lng: {type: Number},
            },
          ],
          area: {
            type: Number,
          },
        },
      ],
      wooId: {type: String},
      meliId: {type: String},
    })
  }

  public getPath(): string {
    return '/shipment-methods'
  }

  public getInstance(database: string) {
    return new (new MongooseModel(this, database).getModel(this.name))()
  }
}

export default new ShipmentMethodSchema()
