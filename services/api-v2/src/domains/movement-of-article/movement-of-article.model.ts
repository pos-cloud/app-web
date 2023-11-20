import {Schema} from 'mongoose'

import MongooseModel from './../../db/mongoose-model'
import Model from './../model/model'

class MovementOfArticleSchema extends Model {
  public name: string = 'movements-of-article'

  constructor() {
    super({
      code: {type: String, trim: true, required: true},
      codeSAT: {type: String, trim: true},
      description: {type: String, trim: true, required: true},
      observation: {type: String, trim: true},
      basePrice: {type: Number, default: 0},
      otherFields: [
        {
          articleField: {type: Schema.Types.ObjectId, ref: 'article-field'},
          name: {type: String, trim: true},
          datatype: {type: String, trim: true},
          value: {type: String, trim: true},
          amount: {type: Number, default: 0},
        },
      ],
      taxes: [
        {
          tax: {type: Schema.Types.ObjectId, ref: 'tax'},
          percentage: {type: Number, default: 0},
          taxBase: {type: Number, default: 0},
          taxAmount: {type: Number, default: 0},
        },
      ],
      movementParent: {type: Schema.Types.ObjectId, ref: 'movement-of-article'},
	  movementOrigin: { type: Schema.Types.ObjectId, ref: 'movement-of-article' },
      isOptional: {type: Boolean, default: false},
      costPrice: {type: Number, default: 0},
      unitPrice: {type: Number, default: 0},
      markupPriceWithoutVAT: {type: Number, default: 0},
      markupPercentage: {type: Number, default: 0},
      markupPrice: {type: Number, default: 0},
      discountRate: {type: Number, default: 0},
      discountAmount: {type: Number, default: 0},
      transactionDiscountAmount: {type: Number, default: 0},
      salePrice: {type: Number, default: 0, required: true},
      roundingAmount: {type: Number, default: 0},
      make: {type: Schema.Types.ObjectId, ref: 'make'},
      category: {type: Schema.Types.ObjectId, ref: 'category', required: true},
      amount: {type: Number, default: 1, required: true},
      deposit: {type: Schema.Types.ObjectId, ref: 'deposit'},
      quantityForStock: {type: Number, default: 0},
      notes: {type: String, trim: true},
      printIn: {type: String, trim: true},
      status: {type: String, trim: true, default: 'Listo', required: true},
      printed: {type: Number, default: 0},
	  read: { type: Number, default: 0 },
      article: {type: Schema.Types.ObjectId, ref: 'article', required: true},
      transaction: {type: Schema.Types.ObjectId, ref: 'transaction', required: true},
      businessRule: {type: Schema.Types.ObjectId, ref: 'business-rule'},
      transactionEndDate: {type: Date},
      measure: {type: String, trim: true},
      quantityMeasure: {type: Number},
      modifyStock: {type: Boolean, default: false, required: true},
      stockMovement: {type: String, trim: true},
      isGeneratedByPayment: {type: Boolean, default: false},
      isGeneratedByRule: {type: Boolean, default: false},
      account: {type: Schema.Types.ObjectId, ref: 'account'},
      recalculateParent: {type: Boolean, default: true},
    })
  }

  public getPath(): string {
    return '/movements-of-articles'
  }

  public getInstance(database: string) {
    return new (new MongooseModel(this, database).getModel(this.name))()
  }
}

export default new MovementOfArticleSchema()
