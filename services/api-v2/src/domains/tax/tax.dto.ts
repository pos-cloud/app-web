import {IsDefined, IsString, IsNumber, ValidateIf} from 'class-validator'

import Account from './../../domains/account/account.interface'
import ModelDto from './../../domains/model/model.dto'

export default class TaxDto extends ModelDto {
  @ValidateIf((o) => !o._id)
  @IsDefined()
  @IsString()
  public code: string

  @ValidateIf((o) => !o._id)
  @IsDefined()
  @IsString()
  public name: string

  @ValidateIf((o) => !o._id)
  @IsDefined()
  @IsString()
  public taxBase: string

  @ValidateIf((o) => !o._id)
  @IsDefined()
  @IsNumber()
  public percentage: number

  @ValidateIf((o) => o.amount !== undefined)
  @IsNumber()
  public amount: number

  @ValidateIf((o) => !o._id)
  @IsDefined()
  @IsString()
  public classification: string

  @ValidateIf((o) => !o._id)
  @IsDefined()
  @IsString()
  public type: string

  @ValidateIf((o) => o.lastNumber !== undefined)
  @IsNumber()
  public lastNumber: number

  public debitAccount: Account
  public creditAccount: Account
}
