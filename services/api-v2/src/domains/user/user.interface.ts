import Branch from './../../domains/branch/branch.interface'
import CashBoxType from './../../domains/cash-box-type/cash-box-type.interface'
import Company from './../../domains/company/company.interface'
import Employee from './../../domains/employee/employee.interface'
import Model from './../../domains/model/model.interface'
import Origin from './../../domains/origin/origin.interface'
import Permission from './../../domains/permission/permission.interface'
import Printer from './../../domains/printer/printer.interface'

export default interface User extends Model {
  branch: Branch
  name: string
  phone: string
  email: string
  password: string
  state: UserState
  opt: string
  token: string
  refreshToken: string
  tokenExpiration: number
  employee: Employee
  company: Company
  origin: Origin
  shortcuts: [{name: string; url: string}]
  printers: [{printer: Printer}]
  cashBoxType: CashBoxType
  level: number
  permission?: Permission
}

export enum UserState {
  Enabled = <any>'Habilitado',
  Disabled = <any>'No Habilitado',
}
