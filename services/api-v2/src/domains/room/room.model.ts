import MongooseModel from './../../db/mongoose-model'
import Model from './../model/model'

class RoomSchema extends Model {
  public name: string = 'room'

  constructor() {
    super({
      description: {type: String, trim: true, require: true},
    })
  }

  public getPath(): string {
    return '/rooms'
  }

  public getInstance(database: string) {
    return new (new MongooseModel(this, database).getModel(this.name))()
  }
}

export default new RoomSchema()
