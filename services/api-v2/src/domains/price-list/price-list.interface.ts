import Article from './../../domains/article/article.interface'
import Category from './../../domains/category/category.interface'
import Make from './../../domains/make/make.interface'
import Model from './../../domains/model/model.interface'

export default interface PriceList extends Model {
  name: string
  percentage: number
  default: boolean
  allowSpecialRules: boolean
  rules: [
    {
      category: Category
      make: Make
      percentage: number
    },
  ]
  exceptions: [
    {
      article: Article
      percentage: number
    },
  ]
}
