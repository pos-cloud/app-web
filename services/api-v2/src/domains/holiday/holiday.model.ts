import MongooseModel from './../../db/mongoose-model'
import Model from './../model/model'

class HolidaySchema extends Model {
  public name: string = 'holiday'

  constructor() {
    super({
      name: {type: String, required: true},
      date: {type: Date, required: true},
    })
  }

  public getPath(): string {
    return '/holidays'
  }

  public getInstance(database: string) {
    return new (new MongooseModel(this, database).getModel(this.name))()
  }
}

export default new HolidaySchema()
