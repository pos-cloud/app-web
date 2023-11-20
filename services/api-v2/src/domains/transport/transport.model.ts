import {Schema} from 'mongoose'

import MongooseModel from './../../db/mongoose-model'
import Model from './../model/model'

class TransportSchema extends Model {
  public name: string = 'transport'

  constructor() {
    super({
      code: {type: Number, default: 0, required: true},
      name: {type: String, trim: true, required: true},
      fantasyName: {type: String, trim: true},
      vatCondition: {type: Schema.Types.ObjectId, ref: 'vat-condition', required: true},
      identificationType: {type: Schema.Types.ObjectId, ref: 'identification-type'},
      identificationValue: {type: String, trim: true},
      grossIncome: {type: String, trim: true},
      address: {type: String, trim: true},
      city: {type: String, trim: true},
      phones: {type: String, trim: true},
      emails: {type: String, trim: true},
      observation: {type: String, trim: true},
      country: {type: Schema.Types.ObjectId, ref: 'country'},
      floorNumber: {type: String, trim: true},
      flat: {type: String, trim: true},
      state: {type: Schema.Types.ObjectId, ref: 'state'},
      addressNumber: {type: String, trim: true},
      group: {type: Schema.Types.ObjectId, ref: 'company-group'},
    })
  }

  public getPath(): string {
    return '/transports'
  }

  public getInstance(database: string) {
    return new (new MongooseModel(this, database).getModel(this.name))()
  }
}

export default new TransportSchema()
