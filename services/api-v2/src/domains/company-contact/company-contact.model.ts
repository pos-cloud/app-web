import {Schema} from 'mongoose'

import MongooseModel from './../../db/mongoose-model'
import Model from './../model/model'

class CompanyConctactSchema extends Model {
  public name: string = 'company-contact'

  constructor() {
    super({
      name: {type: String, trim: true, required: true},
      phone: {type: String, trim: true},
      email: {type: String, trim: true, lowercase: true},
      position: {type: String, trim: true},
      company: {type: Schema.Types.ObjectId, ref: 'company', required: true},
    })
  }

  public getPath(): string {
    return '/company-contacts'
  }

  public getInstance(database: string) {
    return new (new MongooseModel(this, database).getModel(this.name))()
  }
}

export default new CompanyConctactSchema()
