import MongooseModel from './../../db/mongoose-model'
import Model from './../model/model'

class CurrencySchema extends Model {
  public name: string = 'currency-value'

  constructor() {
    super({
      name: {type: String, trim: true, require: true},
      value: {type: Number, require: true},
    })
  }

  public getPath(): string {
    return '/currency-values'
  }

  public getInstance(database: string) {
    return new (new MongooseModel(this, database).getModel(this.name))()
  }
}

export default new CurrencySchema()
