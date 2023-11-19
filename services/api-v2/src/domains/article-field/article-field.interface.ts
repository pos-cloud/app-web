import Model from './../../domains/model/model.interface'

export interface ArticleField extends Model {
  order: number
  name: string
  datatype: ArticleFieldType
  value: string
  modify: boolean
  modifyVAT: boolean
  discriminateVAT: boolean
  ecommerceEnabled: boolean
  wooId?: string
}

export enum ArticleFieldType {
  Percentage = <any>'Porcentaje',
  Number = <any>'Número',
  String = <any>'Alfabético',
  Array = <any>'Lista',
}
