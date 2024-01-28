import {Schema} from 'mongoose'

import MongooseModel from './../../db/mongoose-model'
import Model from './../model/model'

class CompanySchema extends Model {
  public name: string = 'company'

  constructor() {
    super({
      name: {type: String, trim: true, required: true},
      fantasyName: {type: String, trim: true},
      type: {type: String, trim: true, enum: ['Cliente', 'Proveedor'], required: true},
      category: {type: String, trim: true},
      vatCondition: {type: Schema.Types.ObjectId, ref: 'vat-condition', required: true},
      identificationType: {type: Schema.Types.ObjectId, ref: 'identification-type'},
      identificationValue: {type: String, trim: true},
      grossIncome: {type: String, trim: true},
      address: {type: String, trim: true},
      city: {type: String, trim: true},
      phones: {type: String, trim: true},
      emails: {type: String, trim: true},
      birthday: {type: Date},
      gender: {type: String, trim: true, enum: [null, 'Hombre', 'Mujer']},
      observation: {type: String, trim: true},
      allowCurrentAccount: {type: Boolean, default: false},
      country: {type: Schema.Types.ObjectId, ref: 'country'},
      floorNumber: {type: String, trim: true},
      flat: {type: String, trim: true},
      state: {type: Schema.Types.ObjectId, ref: 'state'},
      addressNumber: {type: String, trim: true},
      otherFields: [
        {
          companyField: {
            type: Schema.Types.ObjectId,
            ref: 'company-field',
            required: true,
          },
          name: {type: String, trim: true, required: true},
          datatype: {type: String, trim: true, required: true},
          value: {type: String, trim: true},
          amount: {type: Number, default: 0},
        },
      ],
      group: {type: Schema.Types.ObjectId, ref: 'company-group'},
      employee: {type: Schema.Types.ObjectId, ref: 'employee'},
      transport: {type: Schema.Types.ObjectId, ref: 'transport'},
      priceList: {type: Schema.Types.ObjectId, ref: 'price-list'},
      latitude: {type: String, trim: true},
      longitude: {type: String, trim: true},
      discount: {type: Number, trim: true},
      zipCode: {type: String, trim: true},
      account: {type: Schema.Types.ObjectId, ref: 'account'},
      wooId: {type: String},
      meliId: {type: String},
      creditLimit: {type: Number, default: 0},
    })
  }

  public getPath(): string {
    return '/companies'
  }

  public getInstance(database: string) {
    return new (new MongooseModel(this, database).getModel(this.name))()
  }
}

export default new CompanySchema()
