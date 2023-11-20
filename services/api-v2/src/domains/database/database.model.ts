import MongooseModel from './../../db/mongoose-model'
import Model from './../model/model'

class DatabaseSchema extends Model {
  public name: string = 'database'

  constructor() {
    super({
      name: {type: String, trim: true, required: true},
      email: {type: String, trim: true, required: true},
    })
  }

  public getPath(): string {
    return '/databases'
  }

  public getInstance(database: string) {
    return new (new MongooseModel(this, database).getModel(this.name))()
  }
}

export default new DatabaseSchema()
