import MongooseModel from './../../db/mongoose-model'
import Model from './../model/model'

class HistorySchema extends Model {
  public name: string = 'history'

  constructor() {
    super({
      collectionName: {type: String, required: true},
      doc: {},
    })
  }

  public getPath(): string {
    return '/histories'
  }

  public getInstance(database: string) {
    return new (new MongooseModel(this, database).getModel(this.name))()
  }
}

export default new HistorySchema()
