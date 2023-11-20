import Model from './../../domains/model/model.interface'

export default interface UnitOfMeasurement extends Model {
  code: string
  abbreviation: string
  name: string
}
