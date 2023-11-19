import {Schema} from 'mongoose'

import MongooseModel from './../../db/mongoose-model'
import Model from './../model/model'

class TransactionTypeSchema extends Model {
  public name: string = 'transaction-type'

  constructor() {
    super({
      order: {type: Number, default: 1, required: true},
      branch: {type: Schema.Types.ObjectId, ref: 'branch'},
      transactionMovement: {type: String, trim: true, required: true},
      abbreviation: {type: String, trim: true, required: true},
      name: {type: String, trim: true, required: true},
      labelPrint: {type: String, trim: true},
      currentAccount: {type: String, trim: true, required: true},
      movement: {type: String, trim: true, required: true},
      modifyStock: {type: Boolean, default: false, required: true},
      stockMovement: {type: String, trim: true},
      requestArticles: {type: Boolean, default: false, required: true},
      modifyArticle: {type: Boolean, default: false},
      entryAmount: {
        type: String,
        trim: true,
        default: '',
        enum: ['Costo sin IVA', 'Costo con IVA', 'Venta sin IVA', 'Venta con IVA'],
      },
      requestTaxes: {type: Boolean, default: false, required: true},
      defectOrders: {type: Boolean, default: false},
      allowAPP: {type: Boolean, default: false},
      allowTransactionClose: {type: Boolean, default: true},
      allowEdit: {type: Boolean, default: false},
      allowDelete: {type: Boolean, default: false},
      allowZero: {type: Boolean, default: false},
      allowCompanyDiscount: {type: Boolean, default: true},
      allowPriceList: {type: Boolean, default: true},
      electronics: {type: Boolean, default: false},
      codes: [
        {
          letter: {type: String, trim: true},
          code: {type: Number, default: 0},
        },
      ], // AR
      fiscalCode: {type: String, trim: true},
      fixedOrigin: {type: Number, default: 0},
      fixedLetter: {type: String, trim: true},
      maxOrderNumber: {type: Number, default: 0},
      tax: {type: Boolean, default: false},
      cashBoxImpact: {type: Boolean, default: true},
      cashOpening: {type: Boolean, default: false},
      cashClosing: {type: Boolean, default: false},
      requestPaymentMethods: {type: Boolean, default: true},
      showKeyboard: {type: Boolean, default: false},
      requestCurrency: {type: Boolean, default: false},
      requestTransport: {type: Boolean, default: false},
      showPrices: {type: Boolean, default: true},
      automaticNumbering: {type: Boolean, default: true},
      automaticCreation: {type: Boolean, default: false},
      requestEmployee: {type: Schema.Types.ObjectId, ref: 'employee-type'},
      requestCompany: {type: String, trim: true, enum: [null, 'Cliente', 'Proveedor']},
      fastPayment: {type: Schema.Types.ObjectId, ref: 'payment-method'},
      printable: {type: Boolean, default: false},
      defectPrinter: {type: Schema.Types.ObjectId, ref: 'printer'},
      defectUseOfCFDI: {type: Schema.Types.ObjectId, ref: 'uses-of-cfdi'}, // MX
      isPreprinted: {type: Boolean, default: false},
      showPriceType: {type: String, trim: true, default: 'Precio Final'},
      showDescriptionType: {type: String, trim: true, default: 'Descripción'},
      printDescriptionType: {type: String, trim: true, default: 'Descripción'},
      printSign: {type: Boolean, default: false},
      posKitchen: {type: Boolean, default: false},
      finishCharge: {type: Boolean, default: true},
      readLayout: {type: Boolean, default: false},
      expirationDate: {type: Date},
      updatePrice: {type: String, trim: true},
      updateArticle: {type: Boolean, default: false},
      requestEmailTemplate: {type: Boolean, default: false},
      defectEmailTemplate: {type: Schema.Types.ObjectId, ref: 'email-template'},
      requestShipmentMethod: {type: Boolean, default: false},
      defectShipmentMethod: {type: Schema.Types.ObjectId, ref: 'shipment-method'},
      application: {type: Schema.Types.ObjectId, ref: 'application'},
      company: {type: Schema.Types.ObjectId, ref: 'company'},
      cashBoxType: {type: Schema.Types.ObjectId, ref: 'cash-box-type'},
      level: {type: Number, default: 0},
      groupsArticles: {type: Boolean, default: false},
      printOrigin: {type: Boolean, default: false},
      paymentMethods: [{type: Schema.Types.ObjectId, ref: 'payment-method'}],
      orderNumber: {type: Number, trim: true},
      resetOrderNumber: {type: String, trim: true},
      allowAccounting: {type: Boolean, default: false},
      finishState: {type: String, trim: true},
      optionalAFIP: {
        id: {type: String, trim: true},
        name: {type: String, trim: true},
        value: {type: String, trim: true},
      },
    })
  }

  public getPath(): string {
    return '/transaction-types'
  }

  public getInstance(database: string) {
    return new (new MongooseModel(this, database).getModel(this.name))()
  }
}

export default new TransactionTypeSchema()
