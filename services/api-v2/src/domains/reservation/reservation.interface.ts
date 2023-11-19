import Model from './../../domains/model/model.interface'

export default interface Reservation extends Model {
  title: string
  message: string
  devolution: string
  startDate: Date
  endDate: Date
  state: string
  fixed: boolean
  allDay: boolean
}
