import Country from './../../domains/country/country.interface'
import Model from './../../domains/model/model.interface'

export default interface State extends Model {
  code: number
  name: string
  country: Country
}
