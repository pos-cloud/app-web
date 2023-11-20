import MongooseModel from './../../db/mongoose-model'
import Model from './../model/model'

class RelationTypeSchema extends Model {
  public name: string = 'relation-type'

  constructor() {
    super({
      code: {type: String, trim: true, default: '1', required: true},
      description: {type: String, trim: true, required: true},
    })
  }

  public getPath(): string {
    return '/relation-types'
  }

  public getInstance(database: string) {
    return new (new MongooseModel(this, database).getModel(this.name))()
  }
}

export default new RelationTypeSchema()
