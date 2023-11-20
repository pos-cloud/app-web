import Article from 'domains/article/article.interface'

import Application from './../../domains/application/application.interface'
import Model from './../../domains/model/model.interface'

export interface ShipmentMethod extends Model {
  name: string
  applications: Application[]
  article: Article
  requireAddress?: boolean
  requireTable?: boolean
  zones?: {
    name: string
    cost: number
    type: ZoneType
    points: [
      {
        lat: number
        lng: number
      },
    ]
    area: number
  }[]
  wooId: string
  meliId: string
}

export enum ZoneType {
  IN = <any>'in',
  OUT = <any>'out',
}
