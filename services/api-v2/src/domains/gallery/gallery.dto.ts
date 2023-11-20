import {IsDefined, IsString, IsNumber, ValidateIf, IsArray} from 'class-validator'

import ModelDto from './../../domains/model/model.dto'
import Resource from './../../domains/resource/resource.interface'

export default class GalleryDto extends ModelDto {
  @ValidateIf((o) => !o._id)
  @IsDefined()
  @IsString()
  name: string

  @ValidateIf((o) => !o._id)
  @IsDefined()
  @IsNumber()
  colddown: number

  @ValidateIf((o) => !o._id)
  @IsDefined()
  @IsNumber()
  speed: number

  barcode: boolean

  @ValidateIf((o) => o.resources !== undefined)
  @IsArray()
  resources: {
    resource: Resource
    order: number
  }[]
}
