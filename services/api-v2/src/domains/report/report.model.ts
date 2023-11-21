import MongooseModel from './../../db/mongoose-model'
import Model from './../model/model'

class ReportSchema extends Model {
  public name: string = 'report'

  constructor() {
    super({
      name: {type: String, trim: true, required: true, unique: true},
      query: {type: String, trim: true},
      table: {type: String, trim: true},
      params: [
        {
          name: {type: String, trim: true},
          type: {type: String, trim: true},
        },
      ],
    })
  }

  public getPath(): string {
    return '/reports'
  }

  public getInstance(database: string) {
    return new (new MongooseModel(this, database).getModel(this.name))()
  }
}

export default new ReportSchema()
