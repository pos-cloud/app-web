import Article from './../../domains/article/article.interface'
import Model from './../../domains/model/model.interface'

export default interface Structure extends Model {
  parent: Article
  child: Article
  quantity: number
  utilization: Utilization
  increasePrice: number
  optional: boolean
}

export enum Utilization {
  Production = <any>'Produccion',
  Sale = <any>'Venta',
}
