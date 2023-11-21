import MongooseModel from './../../db/mongoose-model'
import Model from './../model/model'

class ReservationSchema extends Model {
  public name: string = 'reservation'

  constructor() {
    super({
      title: {type: String, trim: true, required: true},
      message: {type: String, trim: true},
      devolution: {type: String, trim: true},
      startDate: {type: Date, required: true},
      endDate: {type: Date, required: true},
      state: {type: String, trim: true, required: true},
      fixed: {type: Boolean, default: false, required: true},
      allDay: {type: Boolean, default: false, required: true},
    })
  }

  public getPath(): string {
    return '/reservations'
  }

  public getInstance(database: string) {
    return new (new MongooseModel(this, database).getModel(this.name))()
  }
}

export default new ReservationSchema()
