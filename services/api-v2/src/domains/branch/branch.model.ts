import MongooseModel from './../../db/mongoose-model'
import Model from './../model/model'

class BranchSchema extends Model {
  public name: string = 'branch'

  constructor() {
    super({
      number: {type: Number, required: true, default: 0},
      name: {type: String, trim: true, require: true},
      default: {type: Boolean, default: false, required: true},
      image: {type: String, trim: true},
    })
  }

  public getPath(): string {
    return '/branches'
  }

  public getInstance(database: string) {
    return new (new MongooseModel(this, database).getModel(this.name))()
  }
}

export default new BranchSchema()
