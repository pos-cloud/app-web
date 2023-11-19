import {IsDefined, IsString, ValidateIf, IsBoolean} from 'class-validator'

import ModelDto from './../../domains/model/model.dto'
import Account from './account.interface'

export default class AccountDto extends ModelDto {
  @ValidateIf((o) => !o._id)
  @IsDefined()
  @IsString()
  public code: string

  @ValidateIf((o) => !o._id)
  @IsDefined()
  @IsString()
  public description: string

  public parent: Account

  @ValidateIf((o) => o.mode)
  @IsString()
  public mode: string
  //activo pasivo patrimonio neto resultado compensatoria otro

  @ValidateIf((o) => o.type)
  @IsString()
  public type: string
  //sintetica analitica
}
