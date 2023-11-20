import {Schema} from 'mongoose'

import MongooseModel from './../../db/mongoose-model'
import Model from './../model/model'

class CompanyNewSchema extends Model {
  public name: string = 'company-new'

  constructor() {
    super({
      date: {type: Date, required: true},
      news: {type: String, trim: true, required: true},
      state: {type: String, trim: true},
      company: {type: Schema.Types.ObjectId, ref: 'company', required: true},
    })
  }

  public getPath(): string {
    return '/company-news'
  }

  public getInstance(database: string) {
    return new (new MongooseModel(this, database).getModel(this.name))()
  }
}

export default new CompanyNewSchema()
