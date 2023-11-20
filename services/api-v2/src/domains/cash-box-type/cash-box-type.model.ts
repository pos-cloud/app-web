import MongooseModel from './../../db/mongoose-model'
import Model from './../model/model'

class CashBoxTypeSchema extends Model {
  public name: string = 'cash-box-type'

  constructor() {
    super({
      name: {type: String, trim: true, require: true, unique: true},
    })
  }

  public getPath(): string {
    return '/cash-box-types'
  }

  public getInstance(database: string) {
    return new (new MongooseModel(this, database).getModel(this.name))()
  }
}

export default new CashBoxTypeSchema()
