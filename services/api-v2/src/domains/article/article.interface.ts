import Account from './../../domains/account/account.interface'
import Application from './../../domains/application/application.interface'
import {ArticleField} from './../../domains/article-field/article-field.interface'
import Category from './../../domains/category/category.interface'
import Classification from './../../domains/classification/classification.interface'
import Company from './../../domains/company/company.interface'
import Currency from './../../domains/currency/currency.interface'
import Deposit from './../../domains/deposit/deposit.interface'
import Make from './../../domains/make/make.interface'
import Model from './../../domains/model/model.interface'
import Taxes from './../../domains/tax/taxes.interface'
import UnitOfMeasurement from './../../domains/unit-of-measurement/unit-of-measurement.interface'
import User from './../../domains/user/user.interface'
import {IMeliAttrs} from './article.model'

export default interface Article extends Model {
  creationDate: string
  creationUser: User
  type: string
  order: number
  containsVariants: boolean
  containsStructure: boolean
  code: string
  codeProvider: string
  codeSAT: string
  description: string
  url: string
  posDescription: string
  quantityPerMeasure: string
  unitOfMeasurement: UnitOfMeasurement
  observation: string
  notes: []
  tags: []
  basePrice: number
  otherFields: {
    articleField: ArticleField
    value: string
    amount: number
  }[]
  taxes: Taxes[]
  costPrice: number
  markupPercentage: number
  markupPrice: number
  salePrice: number
  currency: Currency
  make: Make
  category: Category
  deposits: {
    deposit: Deposit
    capacity: number
  }[]
  locations: {
    location: Location
  }[]
  children: {
    article: Article
    quantity: number
  }[]
  pictures: {
    wooId?: string
    meliId?: string
    picture: string
  }[]
  barcode: string
  wooId: string
  meliId: string
  meliAttrs: IMeliAttrs
  printIn: string
  posKitchen: boolean
  allowPurchase: boolean
  allowSale: boolean
  allowStock: boolean
  allowSaleWithoutStock: boolean
  allowMeasure: boolean
  ecommerceEnabled: boolean
  favourite: boolean
  isWeigth: boolean
  forShipping: boolean
  picture: string
  providers: []
  provider: Company
  applications: Application[]
  classification: Classification
  harticle: Article
  salesAccount: Account
  purchaseAccount: Account
  minStock: Number
  maxStock: Number
  pointOfOrder: Number
  purchasePrice: Number
  costPrice2: Number
  m3: Number
  weight: Number
  width: Number
  height: Number
  depth: Number,
  showMenu: boolean
}
