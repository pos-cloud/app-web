import {
  IsDefined,
  IsString,
  ValidateIf,
  IsBoolean,
  IsArray,
  IsNumber,
} from 'class-validator'

import Account from './../../domains/account/account.interface'
import {ArticleField} from './../../domains/article-field/article-field.interface'
import Category from './../../domains/category/category.interface'
import Classification from './../../domains/classification/classification.interface'
import Company from './../../domains/company/company.interface'
import Currency from './../../domains/currency/currency.interface'
import Deposit from './../../domains/deposit/deposit.interface'
import Location from './../../domains/location/location.interface'
import Make from './../../domains/make/make.interface'
import ModelDto from './../../domains/model/model.dto'
import Tax from './../../domains/tax/tax.interface'
import UnitOfMeasurement from './../../domains/unit-of-measurement/unit-of-measurement.interface'
import Article from './article.interface'

export default class ArticleDto extends ModelDto {
  @ValidateIf((o) => !o._id)
  @IsDefined()
  @IsString()
  type: string

  @IsNumber()
  order: number

  @ValidateIf((o) => o.containsVariants !== undefined)
  @IsBoolean()
  containsVariants: boolean

  @ValidateIf((o) => o.containsStructure !== undefined)
  @IsBoolean()
  containsStructure: boolean

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

  @ValidateIf((o) => !o._id)
  @IsDefined()
  @IsString()
  url: string

  @ValidateIf((o) => !o._id)
  @IsDefined()
  @IsString()
  posDescription: string

  @ValidateIf((o) => o.quantityPerMeasure !== undefined)
  @IsNumber()
  quantityPerMeasure: string

  unitOfMeasurement: UnitOfMeasurement

  @ValidateIf((o) => o.observation !== undefined)
  @IsString()
  observation: string

  @ValidateIf((o) => o.notes !== undefined)
  @IsArray()
  notes: []

  @ValidateIf((o) => o.tags !== undefined)
  @IsArray()
  tags: []

  @ValidateIf((o) => !o._id)
  @IsDefined()
  @IsNumber()
  basePrice: number

  @ValidateIf((o) => o.otherFields !== undefined)
  @IsArray()
  otherFields: {
    articleField: ArticleField
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

  @ValidateIf((o) => !o._id)
  @IsDefined()
  @IsNumber()
  costPrice: number

  @ValidateIf((o) => !o._id)
  @IsDefined()
  @IsNumber()
  markupPercentage: number

  @ValidateIf((o) => !o._id)
  @IsDefined()
  @IsNumber()
  markupPrice: number

  @ValidateIf((o) => !o._id)
  @IsDefined()
  @IsNumber()
  salePrice: number

  currency: Currency

  make: Make

  @ValidateIf((o) => !o._id)
  @IsDefined()
  category: Category

  @ValidateIf((o) => o.deposits !== undefined)
  @IsArray()
  deposits: {
    deposit: Deposit
    capacity: number
  }[]

  @ValidateIf((o) => o.locations !== undefined)
  @IsArray()
  locations: {
    location: Location
  }[]

  @ValidateIf((o) => o.children !== undefined)
  @IsArray()
  children: {
    article: Article
    quantity: number
  }[]

  @ValidateIf((o) => o.pictures !== undefined)
  @IsArray()
  pictures: {
    wooId: string
    meliId: string
    picture: string
  }[]

  @ValidateIf((o) => o.barcode !== undefined)
  @IsString()
  barcode: string

  @ValidateIf((o) => o.wooId !== undefined)
  @IsString()
  wooId: string

  meliId: string
  meliAttrs: {
    category: any
    description: {
      plain_text: string
    }
    listing_type_id: string
    sale_terms: []
    attributes: []
    pictures: {id: string}[]
  }

  @ValidateIf((o) => o.printIn !== undefined)
  @IsString()
  printIn: string

  @ValidateIf((o) => o.posKitchen !== undefined)
  @IsBoolean()
  posKitchen: boolean

  @ValidateIf((o) => o.allowPurchase !== undefined)
  @IsBoolean()
  allowPurchase: boolean

  @ValidateIf((o) => o.allowSale !== undefined)
  @IsBoolean()
  allowSale: boolean

  @ValidateIf((o) => o.allowSaleWithoutStock !== undefined)
  @IsBoolean()
  allowSaleWithoutStock: boolean

  @ValidateIf((o) => o.allowMeasure !== undefined)
  @IsBoolean()
  allowMeasure: boolean

  @ValidateIf((o) => o.ecommerceEnabled !== undefined)
  @IsBoolean()
  ecommerceEnabled: boolean

  @ValidateIf((o) => o.favourite !== undefined)
  @IsBoolean()
  favourite: boolean

  @ValidateIf((o) => o.isWeigth !== undefined)
  @IsBoolean()
  isWeigth: boolean

  @ValidateIf((o) => o.forShipping !== undefined)
  @IsBoolean()
  forShipping: boolean

  @ValidateIf((o) => o.picture !== undefined)
  @IsString()
  picture: string

  @ValidateIf((o) => o.providers !== undefined)
  @IsArray()
  providers: []

  @ValidateIf((o) => o.provider !== undefined)
  @IsArray()
  provider: Company

  @ValidateIf((o) => o.applications !== undefined)
  @IsArray()
  applications: []

  classification: Classification

  harticle: Article

  purchaseAccount: Account
  salesAccount: Account
  minStock: number
  maxStock: number
  pointOfOrder: number
  codeProvider: string
  purchasePrice: number
  costPrice2: number
  m3: number
  weight: number
  width: number
  height: number
  depth: number
  showMenu: boolean
}
