import {Schema} from 'mongoose'

import MongooseModel from './../../db/mongoose-model'
import Model from './../model/model'

class PaymentMethodSchema extends Model {
  public name: string = 'payment-method'

  constructor() {
    super({
      order: {type: Number, default: 1, required: true},
      code: {type: Number, default: 1, required: true},
      name: {type: String, trim: true, required: true},
      discount: {type: Number, default: 0},
      discountArticle: {type: Schema.Types.ObjectId, ref: 'article'},
      surcharge: {type: Number, default: 0},
      surchargeArticle: {type: Schema.Types.ObjectId, ref: 'article'},
      commission: {type: Number, default: 0},
      commissionArticle: {type: Schema.Types.ObjectId, ref: 'article'},
      administrativeExpense: {type: Number, default: 0},
      administrativeExpenseArticle: {type: Schema.Types.ObjectId, ref: 'article'},
      otherExpense: {type: Number, default: 0},
      otherExpenseArticle: {type: Schema.Types.ObjectId, ref: 'article'},
      isCurrentAccount: {type: Boolean, default: false},
      acceptReturned: {type: Boolean, default: false},
      inputAndOuput: {type: Boolean, default: false},
      checkDetail: {type: Boolean, default: false},
      checkPerson: {type: Boolean, default: false},
      cardDetail: {type: Boolean, default: false},
      allowToFinance: {type: Boolean, default: false},
      payFirstQuota: {type: Boolean, default: true},
      cashBoxImpact: {type: Boolean, default: false},
      company: {type: String, trim: true},
      bankReconciliation: {type: Boolean, default: false},
      currency: {type: Schema.Types.ObjectId, ref: 'currency'},
      allowCurrencyValue: {type: Boolean, default: false},
      allowBank: {type: Boolean, default: false},
      observation: {type: String, trim: true},
      mercadopagoAPIKey: {type: String, trim: true},
      mercadopagoClientId: {type: String, trim: true},
      mercadopagoAccessToken: {type: String, trim: true},
      whatsappNumber: {type: String, trim: true},
      applications: [{type: Schema.Types.ObjectId, ref: 'application'}],
      account: {type: Schema.Types.ObjectId, ref: 'account'},
      expirationDays: {type: Number, default: 30},
    })
  }

  public getPath(): string {
    return '/payment-methods'
  }

  public getInstance(database: string) {
    return new (new MongooseModel(this, database).getModel(this.name))()
  }
}

export default new PaymentMethodSchema()
