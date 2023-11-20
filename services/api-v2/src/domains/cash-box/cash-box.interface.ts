import CashBoxType from './../../domains/cash-box-type/cash-box-type.interface'
import Employee from './../../domains/employee/employee.interface'
import Model from './../../domains/model/model.interface'

export default interface CashBox extends Model {
  number: number
  openingDate: Date
  closingDate: Date
  state: CashBoxState
  employee: Employee
  type: CashBoxType
}

export enum CashBoxState {
  Open = <any>'Abierta',
  Closed = <any>'Cerrada',
}
