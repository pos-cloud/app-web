import {Schema} from 'mongoose'

import MongooseModel from '../../db/mongoose-model'
import Model from '../model/model'

class PermissionSchema extends Model {
  public name: string = 'permission'

  constructor() {
    super({
      name: {type: String, trim: true, required: true, unique: true},
      collections: [
        {
          name: {type: String},
          actions: {
            view: {type: Boolean},
            add: {type: Boolean},
            edit: {type: Boolean},
            delete: {type: Boolean},
            export: {type: Boolean},
          },
          values: [
            {
              id: {type: String},
            },
          ],
        },
      ],
      menu: {
        sales: {
          counter: {type: Boolean},
          webOrders: {type: Boolean},
          delivery: {type: Boolean},
          voucherReader: {type: Boolean},
          resto: {type: Boolean},
        },
        gallery: {type: Boolean},
        resto: {type: Boolean},
        money: {type: Boolean},
        production: {type: Boolean},
        purchases: {type: Boolean},
        stock: {type: Boolean},
        articles: {type: Boolean},
        companies: {
          client: {type: Boolean},
          clientSummary: {type: Boolean},
		  clientAccount: {type: Boolean},
          provider: {type: Boolean},
          providerSummary: {type: Boolean},
          providerAccount: {type: Boolean},
          group: {type: Boolean},
          field: {type: Boolean},
        },
		content: {
			resource: {type: Boolean },
			gallery: { type: Boolean }
		},
        report: {type: Boolean},
        config: {type: Boolean},
      },
      filterTransaction: {type: Boolean},
	    filterCompany: {type: Boolean},
      transactionTypes: [{type: Schema.Types.ObjectId, ref: 'transaction-type'}],
	    editArticle: {type: Boolean, default: true },
	    allowDiscount: {type: Boolean, default: true },
      allowPayment: {type: Boolean, default: true }
    })
  }

  public getPath(): string {
    return '/permissions'
  }

  public getInstance(database: string) {
    return new (new MongooseModel(this, database).getModel(this.name))()
  }
}

export default new PermissionSchema()
