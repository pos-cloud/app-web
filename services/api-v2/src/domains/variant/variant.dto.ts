import {IsDefined, ValidateIf} from 'class-validator'

import Article from './../../domains/article/article.interface'
import ModelDto from './../../domains/model/model.dto'
import VariantType from './../../domains/variant-type/variant-type.interface'
import VariantValue from './../../domains/variant-value/variant-value.interface'

export default class VariantDto extends ModelDto {
  @ValidateIf((o) => !o._id)
  @IsDefined()
  public type: VariantType

  @ValidateIf((o) => !o._id)
  @IsDefined()
  public value: VariantValue

  @ValidateIf((o) => !o._id)
  @IsDefined()
  public articleParent: Article

  @ValidateIf((o) => !o._id)
  @IsDefined()
  public articleChild: Article
}
