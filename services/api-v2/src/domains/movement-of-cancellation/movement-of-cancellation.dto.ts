import {IsDefined, IsString, IsNumber, ValidateIf} from 'class-validator'
import CancellationType from 'domains/cancellation-type/cancellation-type.interface'

import ModelDto from './../../domains/model/model.dto'
import Transaction from './../../domains/transaction/transaction.interface'

export default class MovementOfCancellationDto extends ModelDto {
  @ValidateIf((o) => !o._id)
  @IsDefined()
  public transactionOrigin: Transaction

  @ValidateIf((o) => !o._id)
  @IsDefined()
  public transactionDestination: Transaction

  @ValidateIf((o) => !o._id)
  @IsDefined()
  @IsNumber()
  public balance: number

  @ValidateIf((o) => !o._id)
  @IsDefined()
  type: CancellationType
}
