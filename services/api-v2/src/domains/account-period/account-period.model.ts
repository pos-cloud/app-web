import MongooseModel from '../../db/mongoose-model'
import Model from '../model/model'

class AccountPeriodSchema extends Model {
  public name: string = 'account-period'

  constructor() {
    super({
      description: {type: String, trim: true},
      status: {type: String, trim: true, enum: ['Abierto', 'Cerrado']},
      startDate: {type: Date},
      endDate: {type: Date},
    })
  }

  public getPath(): string {
    return '/account-periods'
  }

  public getInstance(database: string) {
    return new (new MongooseModel(this, database).getModel(this.name))()
  }
}

export default new AccountPeriodSchema()
