import {Schema} from 'mongoose'

import MongooseModel from './../../db/mongoose-model'
import Model from './../model/model'

class GallerySchema extends Model {
  public name: string = 'gallery'

  constructor() {
    super({
      name: {type: String, trim: true, required: true},
      colddown: {type: Number, default: 0, required: true},
      speed: {type: Number, default: 0, required: true},
      barcode: {type: Boolean, default: false, required: true},
      resources: [
        {
          resource: {type: Schema.Types.ObjectId, ref: 'resource'},
          order: {type: Number, default: 1},
        },
      ],
    })
  }

  public getPath(): string {
    return '/galleries'
  }

  public getInstance(database: string) {
    return new (new MongooseModel(this, database).getModel(this.name))()
  }
}

export default new GallerySchema()
