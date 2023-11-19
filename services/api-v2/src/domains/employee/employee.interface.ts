import EmployeeType from './../../domains/employee-type/employee-type.interface'
import Model from './../../domains/model/model.interface'

export default interface Employee extends Model {
  code: number
  name: string
  type: EmployeeType
}
