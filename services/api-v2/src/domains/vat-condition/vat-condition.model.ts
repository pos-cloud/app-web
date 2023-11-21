import MongooseModel from './../../db/mongoose-model'
import Model from './../model/model'

class VATConditionSchema extends Model {
  public name: string = 'vat-condition'

  constructor() {
    super({
      code: {type: Number, default: 5, required: true},
      description: {type: String, trim: true, required: true},
      discriminate: {type: Boolean, default: false, required: true},
      observation: {type: String},
      transactionLetter: {type: String, trim: true, default: 'X', required: true},
    })
  }

  public getPath(): string {
    return '/vat-conditions'
  }

  public getInstance(database: string) {
    return new (new MongooseModel(this, database).getModel(this.name))()
  }
}

export default new VATConditionSchema()
