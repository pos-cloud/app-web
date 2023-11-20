import Model from './../../domains/model/model.interface'
import VariantType from './../../domains/variant-type/variant-type.interface'

export default interface VariantValue extends Model {
  type: VariantType
  order: number
  description: string
  picture: string
}
