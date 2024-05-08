import {IsDefined, IsString, IsBoolean, ValidateIf} from 'class-validator'

import ModelDto from './../../domains/model/model.dto'
import {TransactionType} from './../../domains/transaction-type/transaction-type.interface'

export default class CancellationTypeDto extends ModelDto {
  @ValidateIf((o) => !o._id)
  @IsDefined()
  public origin: TransactionType

  @ValidateIf((o) => !o._id)
  @IsDefined()
  public destination: TransactionType

  @ValidateIf((o) => o.automaticSelection !== undefined)
  @IsBoolean()
  public automaticSelection: boolean

  @ValidateIf((o) => o.modifyBalance !== undefined)
  @IsBoolean()
  public modifyBalance: boolean

  @ValidateIf((o) => o.requestAutomatic !== undefined)
  @IsBoolean()
  public requestAutomatic: boolean

  @ValidateIf((o) => o.requestCompany !== undefined)
  @IsBoolean()
  public requestCompany: boolean

  @ValidateIf((o) => !o._id)
  @IsDefined()
  @IsString()
  public requestStatusOrigin: string

  @ValidateIf((o) => !o._id)
  @IsDefined()
  @IsString()
  public stateOrigin: string

  public updatePrices: boolean
  public cancelByArticle: boolean
}
