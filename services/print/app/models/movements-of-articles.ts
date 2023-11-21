import Article from "./article"
import Model from "./model"

export default interface MovementOfArticle extends Model {
  name: string
  code: string
  codeSAT: string
  description: string
  observation: string
  basePrice: number
  otherFields: {
    // articleField: ArticleField
    value: string
    amount: number
  }[]
  taxes:[
    {
    // tax: Tax
    percentage: number
    taxBase: number
    taxAmount: number
  }
  ]

//   movementParent: MovementOfArticle
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
//   make: Make
//   category: Category
  amount: number
//   deposit: Deposit
  quantityForStock: number
  notes: string
  printIn: string
  status: string
  printed: number
  article: Article
//   transaction: Transaction
//   businessRule?: BusinessRule
  transactionEndDate?: string
  measure: string
  quantityMeasure: number
  modifyStock: boolean
//   stockMovement?: StockMovement
  isGeneratedByPayment?: boolean
  isGeneratedByRule?: boolean
//   account: Account
  recalculateParent?: boolean
}
