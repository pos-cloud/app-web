import Account from './../../domains/account/account.interface'
import {ArticleField} from './../../domains/article-field/article-field.interface'
import Article from './../../domains/article/article.interface'
import BusinessRule from './../../domains/business-rule/business-rule.interface'
import Category from './../../domains/category/category.interface'
import Deposit from './../../domains/deposit/deposit.interface'
import Make from './../../domains/make/make.interface'
import Model from './../../domains/model/model.interface'
import Tax from './../../domains/tax/tax.interface'
import {StockMovement} from './../../domains/transaction-type/transaction-type.interface'
import Transaction from './../../domains/transaction/transaction.interface'

export default interface MovementOfArticle extends Model {
  name: string
  code: string
  codeSAT: string
  description: string
  observation: string
  basePrice: number
  otherFields: {
    articleField: ArticleField
    value: string
    amount: number
  }[]
  taxes: {
    tax: Tax
    percentage: number
    taxBase: number
    taxAmount: number
  }[]
  movementParent: MovementOfArticle
  movementOrigin: MovementOfArticle
  isOptional: boolean
  costPrice: number
  unitPrice: number
  markupPercentage: number
  markupPriceWithoutVAT: number
  markupPrice: number
  discountRate: number
  discountAmount: number
  transactionDiscountAmount: number
  salePrice: number
  roundingAmount: number
  make: Make
  category: Category
  amount: number
  deposit: Deposit
  quantityForStock: number
  notes: string
  printIn: string
  status: string
  printed: number
  read: number
  article: Article
  transaction: Transaction
  businessRule?: BusinessRule
  transactionEndDate?: string
  measure: string
  quantityMeasure: number
  modifyStock: boolean
  stockMovement?: StockMovement
  isGeneratedByPayment?: boolean
  isGeneratedByRule?: boolean
  account: Account
  recalculateParent?: boolean
}
