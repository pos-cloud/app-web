import MongooseModel from './../../db/mongoose-model'
import Model from './../model/model'

class CurrencySchema extends Model {
  public name: string = 'currency'

  constructor() {
    super({
      code: {type: String, trim: true, default: '1', required: true},
      sign: {type: String, trim: true, default: '$', required: true},
      name: {type: String, trim: true, required: true},
      quotation: {type: Number, default: 1, required: true},
    })
  }

  public getPath(): string {
    return '/currencies'
  }

  public getInstance(database: string) {
    return new (new MongooseModel(this, database).getModel(this.name))()
  }
}

export default new CurrencySchema()
