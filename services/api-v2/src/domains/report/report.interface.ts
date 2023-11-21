import Model from './../../domains/model/model.interface'

export default interface Report extends Model {
  name: string
  url: string
  table: string
  params: [
    {
      name: string
      type: string
    },
  ]
}
