import {Schema} from 'mongoose'

import MongooseModel from './../../db/mongoose-model'
import Model from './../model/model'

class AddressSchema extends Model {
  public name: string = 'address'

  constructor() {
    super({
      type: {type: String, trim: true},
      name: {type: String, trim: true, required: true},
      number: {type: String, trim: true},
      floor: {type: String, trim: true},
      flat: {type: String, trim: true},
      postalCode: {type: String, trim: true},
      city: {type: String, trim: true},
      state: {type: String, trim: true},
      country: {type: String, trim: true},
      latitude: {type: String, trim: true},
      longitude: {type: String, trim: true},
      observation: {type: String, trim: true},
      forBilling: {type: Boolean, default: true},
      forShipping: {type: Boolean, default: true},
      company: {type: Schema.Types.ObjectId, ref: 'company', required: true},
      shippingStatus: {
        type: String,
        trim: true,
        required: false,
        enum: [
          'Desempaquetado',
          'Enviado',
          'No enviado'
        ],
      },
    })
  }

  public getPath(): string {
    return '/addresses'
  }

  public getInstance(database: string) {
    return new (new MongooseModel(this, database).getModel(this.name))()
  }
}

export default new AddressSchema()
