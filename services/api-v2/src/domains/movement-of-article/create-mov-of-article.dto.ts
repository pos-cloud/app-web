import {IsDefined, IsString, IsBoolean, ValidateIf, IsNumber, Min} from 'class-validator'
import Deposit from 'domains/deposit/deposit.interface'

import ModelDto from './../../domains/model/model.dto'
import MovementOfArticle from './movement-of-article.interface'

export default class CreateMovementOfArticleDto extends ModelDto {
  @IsDefined()
  @IsString()
  transactionId: string

  @IsDefined()
  @IsString()
  articleId: string

  @IsDefined()
  @IsNumber()
  @Min(0)
  quantity: number

  @IsNumber()
  salePrice: number

  @ValidateIf((o) => o.recalculateParent !== undefined && o.recalculateParent !== null)
  @IsBoolean()
  recalculateParent: boolean

  deposit: Deposit

  movementParent: MovementOfArticle
  movementOrigin: MovementOfArticle

}
