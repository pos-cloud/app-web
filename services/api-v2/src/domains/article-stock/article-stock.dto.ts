import {IsDefined, IsNumber, ValidateIf} from 'class-validator'

import Article from './../../domains/article/article.interface'
import Branch from './../../domains/branch/branch.interface'
import Deposit from './../../domains/deposit/deposit.interface'
import ModelDto from './../../domains/model/model.dto'

export default class ArticleStockDto extends ModelDto {
  @ValidateIf((o) => !o._id)
  @IsDefined()
  public article: Article

  @ValidateIf((o) => !o._id)
  @IsDefined()
  public branch: Branch

  @ValidateIf((o) => !o._id)
  @IsDefined()
  public deposit: Deposit

  @ValidateIf((o) => !o._id)
  @IsDefined()
  @IsNumber()
  public realStock: number

  @ValidateIf((o) => o.minStock !== undefined)
  @IsNumber()
  public minStock: number

  @ValidateIf((o) => o.maxStock !== undefined)
  @IsNumber()
  public maxStock: number
}
