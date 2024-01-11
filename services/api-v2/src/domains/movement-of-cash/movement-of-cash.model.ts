import {Schema} from 'mongoose'

import MongooseModel from './../../db/mongoose-model'
import Model from './../model/model'

class MovementOfCashSchema extends Model {
  public name: string = 'movements-of-cash'

  constructor() {
    super({
      date: {type: Date, required: true},
      expirationDate: {type: Date, required: true},
      statusCheck: {
        type: String,
        trim: true,
        default: 'Cerrado',
        enum: ['Rechazado', 'Cerrado', 'Depositado', 'Disponible'],
      },
      discount: {type: Number, default: 0},
      surcharge: {type: Number, default: 0},
      commissionAmount: {type: Number, default: 0},
      administrativeExpenseAmount: {type: Number, default: 0},
      otherExpenseAmount: {type: Number, default: 0},
      quota: {type: Number, default: 1},
      capital: {type: Number, default: 0},
      interestPercentage: {type: Number, default: 0},
      interestAmount: {type: Number, default: 0},
      taxPercentage: {type: Number, default: 0},
      taxAmount: {type: Number, default: 0},
      amountPaid: {type: Number, default: 0, required: true},
      amountDiscount: {type: Number, default: 0},
      balanceCanceled: {type: Number, default: 0},
      cancelingTransaction: {type: Schema.Types.ObjectId, ref: 'transaction'},
      observation: {type: String, trim: true},
      type: {type: Schema.Types.ObjectId, ref: 'payment-method', required: true},
      transaction: {type: Schema.Types.ObjectId, ref: 'transaction', required: true},
      receiver: {type: String, trim: true},
      number: {type: String, trim: true},
      bank: {type: Schema.Types.ObjectId, ref: 'bank'},
      titular: {type: String, trim: true},
      CUIT: {type: String, trim: true},
      deliveredBy: {type: String, trim: true},
      paymentChange: {type: Number, default: 0},
      currencyValues: [
        {
          value: {type: Number, default: 0},
          quantity: {type: Number, default: 0},
        },
      ],
      tokenMP: {type: String, trim: true},
      paymentMP: {type: String, trim: true},
      paymentStatus: {
        type: String,
        trim: true,
        required: false,
        enum: [
          'Autorizado',
          'Pendiente',
          'Pagado',
          'Abandonado',
          'Reembolso',
          'Anulado'
        ],
      },
    })
  }

  public getPath(): string {
    return '/movements-of-cashes'
  }

  public getInstance(database: string) {
    return new (new MongooseModel(this, database).getModel(this.name))()
  }
}

export default new MovementOfCashSchema()
