import {IsDefined, IsString, ValidateIf} from 'class-validator'

import ModelDto from '../model/model.dto'

import {TransactionType} from './../../domains/transaction-type/transaction-type.interface'

export default class PermissionDto extends ModelDto {
  @ValidateIf((o) => !o._id)
  @IsDefined()
  @IsString()
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
    values: {id: TransactionType}[]
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
    resto: boolean
    gallery: boolean
  }
  content: {
	resource: boolean
	gallery: boolean
  }
  filterTransaction: boolean
  filterCompany: boolean
  transactionTypes: TransactionType[]
  editArticle: boolean
  allowDiscount: boolean
}
