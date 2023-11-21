import MongooseModel from './../../db/mongoose-model'
import Model from './../model/model'

class ResourceSchema extends Model {
  public name: string = 'resource'

  constructor() {
    super({
      name: {type: String, trim: true, required: true},
      type: {type: String, trim: true},
      file: {type: String, trim: true, required: true},
    })
  }

  public getPath(): string {
    return '/resources'
  }

  public getInstance(database: string) {
    return new (new MongooseModel(this, database).getModel(this.name))()
  }
}

export default new ResourceSchema()
