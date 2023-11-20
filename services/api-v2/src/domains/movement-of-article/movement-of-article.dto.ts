import {
  IsDefined,
  IsString,
  IsBoolean,
  ValidateIf,
  IsNumber,
  IsArray,
} from 'class-validator'
import * as moment from 'moment'

import Account from './../../domains/account/account.interface'
import {ArticleField} from './../../domains/article-field/article-field.interface'
import Article from './../../domains/article/article.interface'
import BusinessRule from './../../domains/business-rule/business-rule.interface'
import Category from './../../domains/category/category.interface'
import Deposit from './../../domains/deposit/deposit.interface'
import Make from './../../domains/make/make.interface'
import ModelDto from './../../domains/model/model.dto'
import Tax from './../../domains/tax/tax.interface'
import Transaction from './../../domains/transaction/transaction.interface'
import MovementOfArticle from './movement-of-article.interface'

export default class MovementOfArticleDto extends ModelDto {
  @ValidateIf((o) => !o._id)
  @IsDefined()
  @IsString()
  name: string

  @ValidateIf((o) => !o._id)
  @IsDefined()
  @IsString()
  code: string

  @ValidateIf((o) => o.codeSAT !== undefined)
  @IsString()
  codeSAT: string

  @ValidateIf((o) => !o._id)
  @IsDefined()
  @IsString()
  description: string

  @ValidateIf((o) => o.observation !== undefined)
  @IsString()
  observation: string

  @ValidateIf((o) => !o._id)
  @IsDefined()
  @IsNumber()
  basePrice: number

  @ValidateIf((o) => o.otherFields !== undefined)
  @IsArray()
  otherFields: {
    articleField: ArticleField
    name: string
    datatype: string
    value: string
    amount: number
  }[]

  @ValidateIf((o) => o.taxes !== undefined)
  @IsArray()
  taxes: {
    tax: Tax
    percentage: number
    taxBase: number
    taxAmount: number
  }[]

  movementParent: MovementOfArticle
  movementOrigin: MovementOfArticle

  @ValidateIf((o) => o.isOptional !== undefined)
  @IsBoolean()
  isOptional: boolean

  @ValidateIf((o) => !o._id)
  @IsDefined()
  @IsNumber()
  costPrice: number

  @ValidateIf((o) => !o._id)
  @IsDefined()
  @IsNumber()
  unitPrice: number

  @ValidateIf((o) => !o._id)
  @IsDefined()
  @IsNumber()
  markupPercentage: number

  @ValidateIf((o) => !o._id)
  @IsDefined()
  @IsNumber()
  markupPriceWithoutVAT: number

  @ValidateIf((o) => !o._id)
  @IsDefined()
  @IsNumber()
  markupPrice: number

  @ValidateIf((o) => o.discountRate !== undefined)
  @IsNumber()
  discountRate: number

  @ValidateIf((o) => o.discountAmount !== undefined)
  @IsNumber()
  discountAmount: number

  @ValidateIf((o) => !o._id)
  @IsDefined()
  @IsNumber()
  transactionDiscountAmount: number

  @ValidateIf((o) => !o._id)
  @IsDefined()
  @IsNumber()
  salePrice: number

  @ValidateIf((o) => o.isOptional !== undefined)
  @IsNumber()
  roundingAmount: number

  make: Make

  @ValidateIf((o) => !o._id)
  @IsDefined()
  category: Category

  @ValidateIf((o) => !o._id)
  @IsDefined()
  @IsNumber()
  amount: number

  deposit: Deposit

  @ValidateIf((o) => o.quantityForStock !== undefined)
  @IsNumber()
  quantityForStock: number

  @ValidateIf((o) => o.notes !== undefined)
  @IsString()
  notes: string

  @ValidateIf((o) => o.printIn !== undefined)
  @IsString()
  printIn: string

  @ValidateIf((o) => !o._id)
  @IsDefined()
  @IsString()
  status: string

  @ValidateIf((o) => o.printed !== undefined)
  @IsNumber()
  printed: number

  @ValidateIf((o) => !o._id)
  @IsDefined()
  article: Article

  @ValidateIf((o) => {
    return !o._id
  })
  @IsDefined()
  transaction: Transaction

  businessRule: BusinessRule

  @ValidateIf((o) => o.transactionEndDate !== undefined)
  @IsString()
  @ValidateIf((o) => moment(o.transactionEndDate, 'YYYY-MM-DDTHH:mm:ssZ').isValid())
  transactionEndDate: string

  @ValidateIf((o) => o.printIn !== undefined)
  @IsString()
  measure: string

  @ValidateIf((o) => o.quantityMeasure !== undefined)
  @IsNumber()
  quantityMeasure: number

  @ValidateIf((o) => !o._id)
  @IsDefined()
  @IsBoolean()
  modifyStock: boolean

  @ValidateIf((o) => !o._id)
  @IsDefined()
  @IsString()
  stockMovement: string

  @ValidateIf((o) => o.isGeneratedByPayment !== undefined)
  @IsBoolean()
  isGeneratedByPayment: boolean

  @ValidateIf((o) => o.isGeneratedByRule !== undefined)
  @IsBoolean()
  isGeneratedByRule: boolean

  account: Account

  @ValidateIf((o) => o.recalculateParent !== undefined)
  @IsBoolean()
  recalculateParent: boolean

  read: number
}
