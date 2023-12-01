import {Schema} from 'mongoose'

import MongooseModel from './../../db/mongoose-model'
import Model from './../model/model'

class ArticleSchema extends Model {
  public name: string = 'article'

  constructor() {
    super({
      type: {
        type: String,
        trim: true,
        default: 'Final',
        enum: ['Final', 'Variante', 'Ingrediente'],
      },
      order: {type: Number, default: 0},
      containsVariants: {type: Boolean, default: false},
      containsStructure: {type: Boolean, default: false},
      code: {type: String, trim: true},
      codeProvider: {type: String, trim: true},
      codeSAT: {type: String, trim: true},
      description: {type: String, trim: true},
      url: {type: String, trim: true},
      posDescription: {type: String, trim: true},
      quantityPerMeasure: {type: Number, default: 1},
      unitOfMeasurement: {type: Schema.Types.ObjectId, ref: 'unit-of-measurement'},
      observation: {type: String, trim: true},
      notes: [{type: String, trim: true}],
      tags: [{type: String, trim: true}],
      basePrice: {type: Number, default: 0},
      otherFields: [
        {
          articleField: {type: Schema.Types.ObjectId, ref: 'article-field'},
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
      costPrice: {type: Number, default: 0},
      costPrice2: {type: Number, default: 0},
      purchasePrice: {type: Number, default: 0},
      markupPercentage: {type: Number, default: 0},
      markupPrice: {type: Number, default: 0},
      salePrice: {type: Number, default: 0},
      currency: {type: Schema.Types.ObjectId, ref: 'currency'},
      make: {type: Schema.Types.ObjectId, ref: 'make'},
      category: {type: Schema.Types.ObjectId, ref: 'category'},
      deposits: [
        {
          deposit: {type: Schema.Types.ObjectId, ref: 'deposit'},
          capacity: {type: Number, default: 0},
        },
      ],
      locations: [
        {
          location: {type: Schema.Types.ObjectId, ref: 'location'},
        },
      ],
      children: [
        {
          article: {type: Schema.Types.ObjectId, ref: 'article'},
          quantity: {type: Number},
        },
      ],
      pictures: [
        {
          picture: {type: String, trim: true, default: 'default.jpg'},
          meliId: {type: String},
          wooId: {type: String},
        },
      ],
      barcode: {type: String, trim: true},
      wooId: {type: String},
      meliId: {type: String},
      meliAttrs: {
        category: {type: Object, trim: true},
        description: {
          plain_text: {type: String, trim: true, default: ''},
        },
        listing_type_id: {type: String, trim: true, default: 'free'},
        sale_terms: [
          {
            id: {type: String},
            value_name: {type: String},
          },
        ],
        attributes: [
          {
            id: {type: String, trim: true},
            value_name: {type: Object},
          },
        ],
      },
      printIn: {type: String, trim: true},
      posKitchen: {type: Boolean, default: false},
      allowPurchase: {type: Boolean, default: true},
      allowSale: {type: Boolean, default: true},
      allowStock: {type: Boolean, default: true},
      allowSaleWithoutStock: {type: Boolean, default: false},
      allowMeasure: {type: Boolean, default: false},
      ecommerceEnabled: {type: Boolean, default: false},
      favourite: {type: Boolean, default: false},
      isWeigth: {type: Boolean, default: false},
      forShipping: {type: Boolean, default: false},
      picture: {type: String, trim: true, default: 'default.jpg'},
      providers: [{type: Schema.Types.ObjectId, ref: 'company'}],
      provider: {type: Schema.Types.ObjectId, ref: 'company'},
      applications: [{type: Schema.Types.ObjectId, ref: 'application'}],
      classification: {type: Schema.Types.ObjectId, ref: 'classification'},
      harticle: {type: Schema.Types.ObjectId, ref: 'article'},
      salesAccount: {type: Schema.Types.ObjectId, ref: 'account'},
      purchaseAccount: {type: Schema.Types.ObjectId, ref: 'account'},
      minStock: {type: Number},
      maxStock: {type: Number},
      pointOfOrder: {type: Number},
	    m3: {type: Number},
      weight: { type: Number},
      width: { type: Number},
      height: { type: Number},
      depth: { type: Number},
      tiendaNubeId: { type: Number},

    })
  }

  public getPath(): string {
    return '/articles'
  }

  public getInstance(database: string) {
    return new (new MongooseModel(this, database).getModel(this.name))()
  }
}

export default new ArticleSchema()

export interface IMeliAttrs {
  category: any
  description: {
    plain_text: string
  }
  listing_type_id: string
  sale_terms: {
    id: string
    value_name: string
  }[]
  attributes: {
    id: string
    value_name: string
  }[]
}
