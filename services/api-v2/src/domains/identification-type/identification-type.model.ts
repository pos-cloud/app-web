import MongooseModel from './../../db/mongoose-model'
import Model from './../model/model'

class IdentificationTypeSchema extends Model {
  public name: string = 'identification-type'

  constructor() {
    super({
      code: {type: String, default: '1', required: true},
      name: {type: String, trim: true, required: true},
    })
  }

  public getPath(): string {
    return '/identification-types'
  }

  public getInstance(database: string) {
    return new (new MongooseModel(this, database).getModel(this.name))()
  }
}

export default new IdentificationTypeSchema()
