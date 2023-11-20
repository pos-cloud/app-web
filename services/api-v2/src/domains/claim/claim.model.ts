import MongooseModel from './../../db/mongoose-model'
import Model from './../model/model'

class ClaimSchema extends Model {
  public name: string = 'claim'

  constructor() {
    super({
      name: {type: String, trim: true, required: true},
      description: {type: String, trim: true, required: true},
      type: {type: String, trim: true, required: true},
      priority: {type: String, trim: true, required: true},
      author: {type: String, trim: true, required: true},
      email: {type: String, trim: true, lowercase: true, required: true},
      listName: {type: String, trim: true, required: true},
      file: {type: String, trim: true},
    })
  }

  public getPath(): string {
    return '/claims'
  }

  public getInstance(database: string) {
    return new (new MongooseModel(this, database).getModel(this.name))()
  }
}

export default new ClaimSchema()
