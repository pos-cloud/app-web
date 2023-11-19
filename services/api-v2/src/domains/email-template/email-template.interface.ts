import Model from './../../domains/model/model.interface'

export default interface EmailTemplate extends Model {
  name: string
  design: string
}
