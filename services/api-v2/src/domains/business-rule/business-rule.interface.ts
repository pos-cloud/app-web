import Article from '../article/article.interface'
import Model from '../model/model.interface'

import {DiscountType} from './business-rule.dto'

export default interface BusinessRule extends Model {
  code?: string
  name: string
  description?: string
  termsAndConditions?: string
  startDate?: Date
  endDate?: Date
  minAmount?: number
  minQuantity?: number
  transactionAmountLimit?: number
  totalStock: number
  currentStock?: number
  madeIn?: string
  active?: boolean
  discountType: DiscountType
  discountValue: number
  article: Article
  item?: Article
  item2?: Article
  item3?: Article
  transactionTypeIds?: string[]
  days?: Day[]
}

export enum Day {
  Monday = 'Monday',
  Tuesday = 'Tuesday',
  Wednesday = 'Wednesday',
  Thursday = 'Thursday',
  Friday = 'Friday',
  Saturday = 'Saturday',
  Sunday = 'Sunday',
}
