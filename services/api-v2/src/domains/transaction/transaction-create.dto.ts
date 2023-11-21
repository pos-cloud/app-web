import {IsDefined} from 'class-validator'
import MovementOfArticle from 'domains/movement-of-article/movement-of-article.interface'
import MovementOfCash from 'domains/movement-of-cash/movement-of-cash.interface'

import Transaction from './transaction.interface'

export default class TransactionCreateDto {
  @IsDefined()
  public transaction: Transaction

  @IsDefined()
  public movementsOfCashes: MovementOfCash[]

  @IsDefined()
  public movementsOfArticles: MovementOfArticle[]
}
