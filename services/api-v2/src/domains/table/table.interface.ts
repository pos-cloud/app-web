import Employee from './../../domains/employee/employee.interface'
import Model from './../../domains/model/model.interface'
import Room from './../../domains/room/room.interface'
import Transaction from './../../domains/transaction/transaction.interface'

export default interface Table extends Model {
  description: string
  room: Room
  chair: number
  diners: number
  state: string
  employee: Employee
  lastTransaction: Transaction
}
