import Model from './../../domains/model/model.interface'

export default interface Database extends Model {
  name: string
  email: string
}
