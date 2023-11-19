import {IsDefined, IsNumber, IsString, ValidateIf} from 'class-validator'

import Account from './../../domains/account/account.interface'
import ModelDto from './../../domains/model/model.dto'

export default class BankDto extends ModelDto {
  @ValidateIf((o) => !o._id)
  @IsDefined()
  @IsNumber()
  public code: number

  @ValidateIf((o) => o.agency !== undefined)
  @IsNumber()
  public agency: number

  public account: Account

  @ValidateIf((o) => !o._id)
  @IsDefined()
  @IsString()
  public name: string
}
