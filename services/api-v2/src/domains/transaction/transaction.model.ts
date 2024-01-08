import {Schema} from 'mongoose'

import MongooseModel from './../../db/mongoose-model'
import Model from './../model/model'

class TransactionSchema extends Model {
  public name: string = 'transaction'

  constructor() {
    super({
      origin: {type: Number, default: 0, required: true, min: 0},
      letter: {type: String, trim: true, default: ''},
      number: {type: Number, default: 1, required: true, min: 1},
      date: {type: Date},
      startDate: {type: Date, required: true},
      endDate: {type: Date},
      expirationDate: {type: Date},
      VATPeriod: {type: String, trim: true},
      observation: {type: String, trim: true, default: ''},
      basePrice: {type: Number, default: 0, required: true},
      exempt: {type: Number, default: 0},
      discountAmount: {type: Number, default: 0},
      discountPercent: {type: Number, default: 0},
      commissionAmount: {type: Number, default: 0},
      administrativeExpenseAmount: {type: Number, default: 0},
      otherExpenseAmount: {type: Number, default: 0},
      taxes: [
        {
          tax: {type: Schema.Types.ObjectId, ref: 'tax'},
          percentage: {type: Number, default: 0},
          taxBase: {type: Number, default: 0},
          taxAmount: {type: Number, default: 0},
        },
      ],
      totalPrice: {type: Number, default: 0, required: true},
      roundingAmount: {type: Number, default: 0},
      diners: {type: Number, default: 0},
      orderNumber: {type: Number, default: 0},
      state: {
        type: String,
        trim: true,
        required: true,
        enum: [
          'Abierto',
          'Pendiente de pago',
          'Pago Confirmado',
          'Pago Rechazado',
          'Anulado',
          'Armando',
          'Cerrado',
          'Entregado',
          'Enviado',
          'Preparando',
          'Pendiente',
        ],
      },
      madein: {type: String, trim: true},
      balance: {type: Number, default: 0},
      CAE: {type: String, trim: true}, // AR
      CAEExpirationDate: {type: Date}, // AR
      stringSAT: {type: String, trim: true}, // MX
      CFDStamp: {type: String, trim: true}, // MX
      SATStamp: {type: String, trim: true}, // MX
      UUID: {type: String, trim: true}, // MX
      currency: {type: Schema.Types.ObjectId, ref: 'currency'},
      deliveryAddress: {type: Schema.Types.ObjectId, ref: 'address'},
      quotation: {type: Number, default: 1},
      printed: {type: Number, default: 0},
      wooId: {type: String},
      meliId: {type: String},
      relationType: {type: Schema.Types.ObjectId, ref: 'relation-type'}, // MX
      useOfCFDI: {type: Schema.Types.ObjectId, ref: 'use-of-cfdi'}, // MX
      type: {type: Schema.Types.ObjectId, ref: 'transaction-type', required: true},
      cashBox: {type: Schema.Types.ObjectId, ref: 'cash-box'},
      table: {type: Schema.Types.ObjectId, ref: 'table'},
      employeeOpening: {type: Schema.Types.ObjectId, ref: 'employee'},
      employeeClosing: {type: Schema.Types.ObjectId, ref: 'employee'},
      branchOrigin: {type: Schema.Types.ObjectId, ref: 'branch'},
      branchDestination: {type: Schema.Types.ObjectId, ref: 'branch'},
      depositOrigin: {type: Schema.Types.ObjectId, ref: 'deposit'},
      depositDestination: {type: Schema.Types.ObjectId, ref: 'deposit'},
      company: {type: Schema.Types.ObjectId, ref: 'company'},
      transport: {type: Schema.Types.ObjectId, ref: 'transport'},
      businessRules: [{type: Schema.Types.ObjectId, ref: 'business-rule'}],
      declaredValue: {type: Number, trim: true, default: 0},
      package: {type: Number, trim: true, default: 0},
      shipmentMethod: {type: Schema.Types.ObjectId, ref: 'shipment-method'},
      priceList: {type: Schema.Types.ObjectId, ref: 'price-list'},
      account: {type: Schema.Types.ObjectId, ref: 'account'},
      tracking: [{date: {type: Date, trim: true}, state: {type: String, trim: true}}],
      paymentMethodEcommerce: {type: String, trim: true},
      tiendaNubeId:  {type: String},
      updateDate: {type: Date},
      optionalAFIP: {
        id: {type: String, trim: true},
        value: {type: String, trim: true},
      },
    })
  }

  public getPath(): string {
    return '/transactions'
  }

  public getInstance(database: string) {
    return new (new MongooseModel(this, database).getModel(this.name))()
  }
}

export default new TransactionSchema()
