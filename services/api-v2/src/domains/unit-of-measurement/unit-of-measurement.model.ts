import MongooseModel from './../../db/mongoose-model'
import Model from './../model/model'

class UnitOfMeasurementSchema extends Model {
  public name: string = 'unit-of-measurement'

  constructor() {
    super({
      code: {type: String, trim: true, default: '1', required: true, unique: true},
      abbreviation: {type: String, trim: true, required: true, unique: true},
      name: {type: String, trim: true, required: true, unique: true},
    })
  }

  public getPath(): string {
    return '/units-of-measurement'
  }

  public getInstance(database: string) {
    return new (new MongooseModel(this, database).getModel(this.name))()
  }
}

export default new UnitOfMeasurementSchema()
