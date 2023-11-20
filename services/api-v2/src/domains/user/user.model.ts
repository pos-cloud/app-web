import {Schema} from 'mongoose'

import MongooseModel from './../../db/mongoose-model'
import Model from './../model/model'

class UserSchema extends Model {
  public name: string = 'user'

  constructor() {
    super({
      branch: {type: Schema.Types.ObjectId, ref: 'branch'},
      name: {type: String, trim: true, require: true},
      phone: {type: String, trim: true},
      email: {type: String, trim: true, lowercase: true, required: true},
      password: {type: String, trim: true},
      state: {
        type: String,
        trim: true,
        require: true,
        enum: ['Habilitado', 'No Habilitado'],
      },
      opt: {type: String, trim: true, minlength: 4, maxlength: 4},
      token: {type: String, trim: true},
      refreshToken: {type: String, trim: true},
      employee: {type: Schema.Types.ObjectId, ref: 'employee'},
      company: {type: Schema.Types.ObjectId, ref: 'company'},
      origin: {type: Schema.Types.ObjectId, ref: 'origin'},
      tokenExpiration: {type: Number, default: 1440},
      shortcuts: [
        {
          name: {type: String, trim: true},
          url: {type: String, trim: true},
        },
      ],
      printers: [
        {
          printer: {type: Schema.Types.ObjectId, ref: 'printer'},
        },
      ],
      cashBoxType: {type: Schema.Types.ObjectId, ref: 'cash-box-type'},
      permission: {type: Schema.Types.ObjectId, ref: 'permission'},
      level: {type: Number, default: 99, required: true},
    })
  }

  public getPath(): string {
    return '/users'
  }

  public getInstance(database: string) {
    return new (new MongooseModel(this, database).getModel(this.name))()
  }
}

export default new UserSchema()
