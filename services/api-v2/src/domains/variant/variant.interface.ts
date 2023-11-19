import Article from './../../domains/article/article.interface'
import Model from './../../domains/model/model.interface'
import VariantType from './../../domains/variant-type/variant-type.interface'
import VariantValue from './../../domains/variant-value/variant-value.interface'

export default interface Variant extends Model {
  type: VariantType
  value: VariantValue
  articleParent: Article
  articleChild: Article
}
