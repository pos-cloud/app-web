import {Schema} from 'mongoose'

import MongooseModel from '../../db/mongoose-model'
import Model from '../model/model'

class BusinessRuleSchema extends Model {
  public name: string = 'business-rule'

  constructor() {
    super({
      code: {type: String, trim: true, required: true},
      name: {type: String, trim: true, required: true},
      description: {type: String},
      termsAndConditions: {type: String},
      startDate: {type: Date},
      endDate: {type: Date},
      minAmount: {type: Number, default: 0},
      minQuantity: {type: Number, deafult: 0},
      transactionAmountLimit: {type: Number, default: 0},
      totalStock: {type: Number, default: 1, required: true},
      currentStock: {type: Number, default: 0},
      madeIn: {type: String},
      active: {type: Boolean, default: true},
      discountType: {type: String, enum: ['percentage', 'amount'], required: true},
      discountValue: {type: Number, default: 0},
      article: {type: Schema.Types.ObjectId, ref: 'article'},
      item: {type: Schema.Types.ObjectId, ref: 'article'},
      item2: {type: Schema.Types.ObjectId, ref: 'article'},
      item3: {type: Schema.Types.ObjectId, ref: 'article'},
      transactionTypeIds: [{type: String}],
      days: [
        {
          type: String,
          enum: [
            'Monday',
            'Tuesday',
            'Wednesday',
            'Thursday',
            'Friday',
            'Saturday',
            'Sunday',
          ],
        },
      ],
      default: [
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
        'Sunday',
      ],
    })
  }

  public getPath(): string {
    return '/business-rules'
  }

  public getInstance(database: string) {
    return new (new MongooseModel(this, database).getModel(this.name))()
  }
}

export default new BusinessRuleSchema()
