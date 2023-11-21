import MongooseModel from './../../db/mongoose-model'
import Model from './../model/model'

class CompanyFieldSchema extends Model {
  public name: string = 'company-field'

  constructor() {
    super({
      name: {type: String, trim: true, required: true},
      datatype: {type: String, trim: true, required: true},
      value: {type: String, trim: true, required: true},
    })
  }

  public getPath(): string {
    return '/company-fields'
  }

  public getInstance(database: string) {
    return new (new MongooseModel(this, database).getModel(this.name))()
  }
}

export default new CompanyFieldSchema()
