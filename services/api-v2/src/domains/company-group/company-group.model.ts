import MongooseModel from './../../db/mongoose-model'
import Model from './../model/model'

class CompanyGroupSchema extends Model {
  public name: string = 'company-group'

  constructor() {
    super({
      description: {type: String, required: true},
      discount: {type: Number},
    })
  }

  public getPath(): string {
    return '/company-groups'
  }

  public getInstance(database: string) {
    return new (new MongooseModel(this, database).getModel(this.name))()
  }
}

export default new CompanyGroupSchema()
