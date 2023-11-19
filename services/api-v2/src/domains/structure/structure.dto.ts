import {IsDefined, IsString, IsNumber, ValidateIf, IsBoolean} from 'class-validator'

import Article from './../../domains/article/article.interface'
import ModelDto from './../../domains/model/model.dto'

export default class StructureDto extends ModelDto {
  @ValidateIf((o) => !o._id)
  @IsDefined()
  public parent: Article

  @ValidateIf((o) => !o._id)
  @IsDefined()
  public child: Article

  @ValidateIf((o) => !o._id)
  @IsDefined()
  @IsNumber()
  public quantity: number

  @ValidateIf((o) => !o._id)
  @IsDefined()
  @IsString()
  public utilization: string

  @ValidateIf((o) => o.increasePrice !== undefined)
  @IsNumber()
  public increasePrice: number

  @ValidateIf((o) => o.optional !== undefined)
  @IsBoolean()
  public optional: boolean
}
