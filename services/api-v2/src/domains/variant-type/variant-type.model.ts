import MongooseModel from './../../db/mongoose-model'
import Model from './../model/model'

class VariantTypeSchema extends Model {
  public name: string = 'variant-type'

  constructor() {
    super({
      order: {type: Number, default: 1, required: true},
      name: {type: String, trim: true, required: true},
      meliId: {type: String},
    })
  }

  public getPath(): string {
    return '/variant-types'
  }

  public getInstance(database: string) {
    return new (new MongooseModel(this, database).getModel(this.name))()
  }
}

export default new VariantTypeSchema()
