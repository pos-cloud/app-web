import MongooseModel from './../../db/mongoose-model'
import Model from './../model/model'

class SessionSchema extends Model {
  public name: string = 'session'

  constructor() {
    super({
      type: {type: String, trim: true, required: true},
      state: {type: String, trim: true, required: true},
      date: {type: Date, required: true},
    })
  }

  public getPath(): string {
    return '/sessions'
  }

  public getInstance(database: string) {
    return new (new MongooseModel(this, database).getModel(this.name))()
  }
}

export default new SessionSchema()
