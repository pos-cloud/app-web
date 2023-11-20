import {Schema} from 'mongoose'

import MongooseModel from './../../db/mongoose-model'
import Model from './../model/model'

class LocationSchema extends Model {
  public name: string = 'location'

  constructor() {
    super({
      description: {type: String, trim: true, required: true},
      positionX: {type: String, trim: true},
      positionY: {type: String, trim: true},
      positionZ: {type: String, trim: true},
      deposit: {type: Schema.Types.ObjectId, ref: 'deposit'},
    })
  }

  public getPath(): string {
    return '/locations'
  }

  public getInstance(database: string) {
    return new (new MongooseModel(this, database).getModel(this.name))()
  }
}

export default new LocationSchema()
