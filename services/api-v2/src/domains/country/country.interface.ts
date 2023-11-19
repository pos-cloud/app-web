import Model from './../../domains/model/model.interface'

export default interface Country extends Model {
  code: number
  name: string
  callingCodes: string
  timezones: string
  flag: string
  alpha2Code: string
  alpha3Code: string
}
