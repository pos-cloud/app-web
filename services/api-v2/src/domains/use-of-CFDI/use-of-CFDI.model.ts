import MongooseModel from './../../db/mongoose-model'
import Model from './../model/model'

class UseOfCFDISchema extends Model {
  public name: string = 'use-of-cdfi'

  constructor() {
    super({
      code: {type: String, trim: true, required: true},
      description: {type: String, trim: true, required: true},
    })
  }

  public getPath(): string {
    return '/uses-of-cdfi'
  }

  public getInstance(database: string) {
    return new (new MongooseModel(this, database).getModel(this.name))()
  }
}

export default new UseOfCFDISchema()
