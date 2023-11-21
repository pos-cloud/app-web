import Model from './../../domains/model/model.interface'
import {TransactionType} from './../../domains/transaction-type/transaction-type.interface'

export default interface Permission extends Model {
  name: string
  collections: {
    name: string
    actions: {
      view: boolean
      add: boolean
      edit: boolean
      delete: boolean
      export: boolean
    }
  }[]
  menu: {
    sales: {
      counter: boolean
      webOrders: boolean
      delivery: boolean
      voucherReader: boolean
      resto: boolean
    }
    money: boolean
    production: boolean
    purchases: boolean
    stock: boolean
    articles: boolean
    companies: {
		client: boolean,
		clientSummary: boolean,
		clientAccount: boolean,
		provider: boolean,
		providerSummary: boolean,
		providerAccount: boolean,
		group: boolean,
		field: boolean,
    }
    report: boolean
    config: boolean
    gallery: boolean
    resto: boolean
  },
  content: {
	resource: boolean
	gallery: boolean
  },
  filterTransaction:boolean
  filterCompany:boolean
  transactionTypes: TransactionType[]
  editArticle: boolean
  allowDiscount: boolean
}
