import MongooseModel from './../../db/mongoose-model'
import Model from './../model/model'

class ClassificationSchema extends Model {
  public name: string = 'classification'

  constructor() {
    super({
      name: {type: String, trim: true, require: true},
    })
  }

  public getPath(): string {
    return '/classifications'
  }

  public getInstance(database: string) {
    return new (new MongooseModel(this, database).getModel(this.name))()
  }
}

export default new ClassificationSchema()
