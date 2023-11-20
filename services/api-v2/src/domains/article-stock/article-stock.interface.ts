import Article from './../../domains/article/article.interface'
import Branch from './../../domains/branch/branch.interface'
import Deposit from './../../domains/deposit/deposit.interface'
import Model from './../../domains/model/model.interface'

export default interface ArticleStock extends Model {
  article: Article
  branch: Branch
  deposit: Deposit
  realStock: number
  minStock: number
  maxStock: number
}
