import {Schema} from 'mongoose'

import MongooseModel from './../../db/mongoose-model'
import Model from './../model/model'
class EmployeeSchema extends Model {
  public name: string = 'employee'

  constructor() {
    super({
      code: {type: Number, default: 0, require: true},
      name: {type: String, trim: true, require: true},
      type: {type: Schema.Types.ObjectId, ref: 'employee-type'},
    })
  }

  public getPath(): string {
    return '/employees'
  }

  public getInstance(database: string) {
    return new (new MongooseModel(this, database).getModel(this.name))()
  }
}

export default new EmployeeSchema()
