import MongooseModel from './../../db/mongoose-model'
import Model from './../model/model'

class CountrySchema extends Model {
  public name: string = 'country'

  constructor() {
    super({
      code: {type: String, trim: true, required: true},
      name: {type: String, trim: true, required: true},
      callingCodes: {type: String, trim: true},
      timezones: {type: String, trim: true},
      flag: {type: String, trim: true},
      alpha2Code: {type: String, trim: true},
      alpha3Code: {type: String, trim: true},
    })
  }

  public getPath(): string {
    return '/countries'
  }

  public getInstance(database: string) {
    return new (new MongooseModel(this, database).getModel(this.name))()
  }
}

export default new CountrySchema()
