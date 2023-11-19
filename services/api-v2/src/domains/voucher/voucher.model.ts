import MongooseModel from './../../db/mongoose-model'
import Model from './../model/model'

class VoucherSchema extends Model {
  public name: string = 'voucher'

  constructor() {
    super({
      date: {type: Date, required: true},
      token: {type: String, trim: true, required: true},
      readings: {type: Number, default: 0},
      expirationDate: {type: Date, required: true},
    })
  }

  public getPath(): string {
    return '/vouchers'
  }

  public getInstance(database: string) {
    return new (new MongooseModel(this, database).getModel(this.name))()
  }
}

export default new VoucherSchema()
