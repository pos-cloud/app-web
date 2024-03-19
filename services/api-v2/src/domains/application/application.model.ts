import {Schema} from 'mongoose'

import MongooseModel from './../../db/mongoose-model'
import Model from './../model/model'

class ApplicationSchema extends Model {
  public name: string = 'application'

  constructor() {
    super({
      order: {type: Number, default: 0, required: true},
      name: {type: String, trim: true, required: true, unique: true},
      url: {type: String, trim: true, unique: true},
      type: {
        type: String,
        trim: true,
        required: true,
        enum: ['Web', 'App', 'Woocommerce'],
      },
      socialNetworks: {
        facebook: {type: String, trim: true},
        instagram: {type: String, trim: true},
        youtube: {type: String, trim: true},
        twitter: {type: String, trim: true},
      },
      contact: {
        phone: {type: Number},
        whatsapp: {type: Number},
        claim: {type: Number},
      },
      design: {
        labelNote: {type: String},
        about: {type: String},
        categoryTitle: {type: String, trim: true, default: 'Categorías'},
        categoriesByLine: {type: Number, default: 3},
        showSearchBar: {type: Boolean, default: true},
        resources: {
          logo: {type: String, trim: true},
          banners: [{type: String, trim: true}],
        },
        colors: {
          primary: {type: String, default: '#611A1E'},
          secondary: {type: String, default: '#FF0000'},
          tercery: {type: String, default: '#FCB34B'},
          background: {type: String, default: '#1C1E21'},
          backgroundHeader: {type: String, default: '#1C1E21'},
          backgroundFooter: {type: String, default: '#1C1E21'},
          font: {type: String, default: '#FFFFFF'},
        },
        home: [
          {
            title: {type: String, trim: true},
            view: {type: String, trim: true},
            order: {type: Number},
            resources: [
              {
                article: {type: Schema.Types.ObjectId, ref: 'article'},
                category: {type: Schema.Types.ObjectId, ref: 'category'},
                banner: {type: String, trim: true},
                order: {type: Number},
                link: {type: String, trim: true},
              },
            ],
          },
        ],
        font: {
          family: {type: String, trim: true},
          weight: {type: String, trim: true},
          style: {type: String, trim: true},
          size: {type: String, trim: true},
        },
      },
      auth: {
        requireOPT: {type: Boolean, default: false},
        messageOPT: {type: String, default: false},
      },
      integrations: {
        meli: {
          code: {type: String},
          token: {type: String},
          refreshToken: {type: String},
        },
      },
      notifications: {
        app: {
          checkout: {type: String},
          temporaryMessage: {type: String},
        },
        email: {
          checkout: {type: String},
        },
      },
      schedule: [
        {
          day: {type: String},
          to: {type: String},
          from: {type: String},
        },
      ],
      email: {
        register: {
          enabled: {type: Boolean, default: true},
          template: {type: Schema.Types.ObjectId, ref: 'email-template'},
        },
        endTransaction: {
          enabled: {type: Boolean, default: true},
          template: {type: Schema.Types.ObjectId, ref: 'email-template'},
        },
        statusTransaction: {
          paymentConfirmed: {
            enabled: {type: Boolean, default: true},
            template: {type: Schema.Types.ObjectId, ref: 'email-template'},
          },
          paymentDeclined: {
            enabled: {type: Boolean, default: true},
            template: {type: Schema.Types.ObjectId, ref: 'email-template'},
          },
          closed: {
            enabled: {type: Boolean, default: true},
            template: {type: Schema.Types.ObjectId, ref: 'email-template'},
          },
          sent: {
            enabled: {type: Boolean, default: true},
            template: {type: Schema.Types.ObjectId, ref: 'email-template'},
          },
          delivered: {
            enabled: {type: Boolean, default: true},
            template: {type: Schema.Types.ObjectId, ref: 'email-template'},
          },
        },
      },
      tiendaNube: {
        userId: { type: Number },
        token: { type: String },
        transactionType: {type: Schema.Types.ObjectId, ref: 'transaction-type'},
        shipmentMethod: {type: Schema.Types.ObjectId, ref: 'shipment-method'}, 
        paymentMethod:  {type: Schema.Types.ObjectId, ref: 'payment-method'},
        company: {type: Schema.Types.ObjectId, ref: 'company'},
      },
      menu: {
        portain: { type: String },
        background: { type: String },
        article: {
            font: { type: String },
            size: { type: Number },
            color: { type: String },
            style: { type: String },
            weight: { type: String },
        },
        category: {
            font: { type: String },
            size: { type: Number },
            color: { type: String },
            style: { type: String },
            weight: { type: String },
        },
        price: {
            font: { type: String },
            size: { type: Number },
            color: { type: String },
            style: { type: String },
            weight: { type: String },
        },
        observation: {
            font: { type: String },
            size: { type: Number },
            color: { type: String },
            style: { type: String },
            weight: { type: String }
        }
      },
    })
  }

  public getPath(): string {
    return '/applications'
  }

  public getInstance(database: string) {
    return new (new MongooseModel(this, database).getModel(this.name))()
  }
}

export default new ApplicationSchema()
