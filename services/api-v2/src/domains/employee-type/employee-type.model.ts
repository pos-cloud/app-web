import MongooseModel from './../../db/mongoose-model'
import Model from './../model/model'

class EmployeeTypeSchema extends Model {
  public name: string = 'employee-type'

  constructor() {
    super({
      description: {type: String, trim: true, require: true, unique: true},
    })
  }

  public getPath(): string {
    return '/employee-types'
  }

  public getInstance(database: string) {
    return new (new MongooseModel(this, database).getModel(this.name))()
  }
}

export default new EmployeeTypeSchema()
