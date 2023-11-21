import {IsDefined, IsString, IsArray, ValidateIf, IsBoolean} from 'class-validator'
import Article from 'domains/article/article.interface'

import Application from './../../domains/application/application.interface'
import ModelDto from './../../domains/model/model.dto'
import {ZoneType} from './shipment-method.interface'

export default class ShipmentMethodDto extends ModelDto {
  @ValidateIf((o) => !o._id)
  @IsDefined()
  @IsString()
  public name: string

  @ValidateIf((o) => o.applications !== undefined)
  @IsArray()
  applications: Application[]

  article: Article

  @ValidateIf((o) => o.requireAddress !== undefined)
  @IsBoolean()
  requireAddress: Boolean

  @ValidateIf((o) => o.requireTable !== undefined)
  @IsBoolean()
  requireTable: Boolean

  @ValidateIf((o) => o.zones !== undefined)
  @IsArray()
  zones?: {
    name: string
    type: ZoneType
    cost: number
    points: {
      lat: number
      lng: number
    }[]
    area: number
  }[]

  @ValidateIf((o) => o.wooId !== undefined)
  @IsString()
  wooId: string

  @ValidateIf((o) => o.meliId !== undefined)
  @IsString()
  meliId: string
}
