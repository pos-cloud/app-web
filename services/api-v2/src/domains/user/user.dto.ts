import {
  IsDefined,
  IsEmail,
  IsNumber,
  IsString,
  MinLength,
  ValidateIf,
  IsLowercase,
  IsArray,
  MaxLength,
} from 'class-validator'

import Branch from './../../domains/branch/branch.interface'
import CashBoxType from './../../domains/cash-box-type/cash-box-type.interface'
import Company from './../../domains/company/company.interface'
import Employee from './../../domains/employee/employee.interface'
import ModelDto from './../../domains/model/model.dto'
import Origin from './../../domains/origin/origin.interface'
import Permission from './../../domains/permission/permission.interface'
import Printer from './../../domains/printer/printer.interface'
import {UserState} from './user.interface'

export default class UserDto extends ModelDto {
  branch: Branch

  @ValidateIf((o) => !o._id)
  @IsDefined()
  @IsString()
  name: string

  @ValidateIf((o) => o.phone !== undefined)
  @IsString()
  phone: string

  @ValidateIf((o) => !o._id)
  @IsDefined()
  @IsString()
  @IsLowercase()
  @IsEmail({}, {message: 'Debe completar con un correo válido'})
  email: string

  @ValidateIf((o) => o.password !== undefined)
  @IsString()
  @MinLength(4, {message: 'La contraseña debe tener mínimo 4 carácteres'})
  password: string

  @ValidateIf((o) => !o._id)
  @IsDefined()
  @IsString()
  state: UserState

  @ValidateIf((o) => o.opt !== undefined)
  @IsString()
  @MinLength(4)
  @MaxLength(4)
  opt: string

  @ValidateIf((o) => o.token !== undefined)
  @IsString()
  token: string

  @ValidateIf((o) => o.refreshToken !== undefined)
  @IsString()
  refreshToken: string

  @ValidateIf((o) => o.tokenExpiration !== undefined)
  @IsNumber()
  tokenExpiration: number

  employee: Employee

  company: Company

  origin: Origin

  @ValidateIf((o) => o.shortcuts !== undefined)
  @IsArray()
  shortcuts: {
    name: string
    url: string
  }[]

  @ValidateIf((o) => o.printers !== undefined)
  @IsArray()
  printers: {
    printer: Printer
  }[]

  @ValidateIf((o) => o.printers !== undefined)
  @IsArray()
  cashBoxType: CashBoxType

  @ValidateIf((o) => !o._id)
  @IsDefined()
  @IsNumber()
  level: number

  @ValidateIf((o) => o.permission !== undefined)
  permission: Permission
}
