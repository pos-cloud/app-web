import MongooseModel from './../../db/mongoose-model'
import Model from './../model/model'

class PrintSchema extends Model {
  public name: string = 'print'

  constructor() {
    super({
      fileName: {type: String, trim: true, required: true},
      content: {type: String, trim: true, required: true},
    })
  }

  public getPath(): string {
    return '/prints'
  }

  public getInstance(database: string) {
    return new (new MongooseModel(this, database).getModel(this.name))()
  }
}

export default new PrintSchema()
