import Model from './../../domains/model/model.interface'
import Resource from './../../domains/resource/resource.interface'

export default interface Gallery extends Model {
  name: string
  colddown: number
  speed: number
  barcode: boolean
  resources: [
    {
      resource: Resource
      order: number
    },
  ]
}
