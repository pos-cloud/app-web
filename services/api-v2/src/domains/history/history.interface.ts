import Model from './../../domains/model/model.interface'

export default interface History extends Model {
  collectionName: string
  doc: any
}
