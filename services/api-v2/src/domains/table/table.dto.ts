import {IsDefined, IsString, IsNumber, ValidateIf} from 'class-validator'

import Employee from './../../domains/employee/employee.interface'
import ModelDto from './../../domains/model/model.dto'
import Room from './../../domains/room/room.interface'
import Transaction from './../../domains/transaction/transaction.interface'

export default class TableDto extends ModelDto {
  @ValidateIf((o) => !o._id)
  @IsDefined()
  @IsString()
  public description: string

  @ValidateIf((o) => !o._id)
  @IsDefined()
  public room: Room

  @ValidateIf((o) => !o._id)
  @IsDefined()
  @IsNumber()
  public chair: number

  @ValidateIf((o) => o.diners !== undefined)
  @IsNumber()
  public diners: number

  @ValidateIf((o) => !o._id)
  @IsDefined()
  @IsString()
  public state: string

  @ValidateIf((o) => !o._id)
  @IsDefined()
  public employee: Employee

  @ValidateIf((o) => !o._id)
  @IsDefined()
  public lastTransaction: Transaction
}
