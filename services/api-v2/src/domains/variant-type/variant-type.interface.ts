import Model from './../../domains/model/model.interface'

export default interface VariantType extends Model {
  name: string
  meliId?: string
}
