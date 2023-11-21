import Model from '../model/model.interface'

export default interface AccountPeriod extends Model {
  description: string
  status?: string
  startDate?: Date
  endDate?: Date
}
