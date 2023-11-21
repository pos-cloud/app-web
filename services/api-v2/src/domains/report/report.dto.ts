import {IsDefined, IsString, ValidateIf} from 'class-validator'

import ModelDto from './../../domains/model/model.dto'

export default class ReportDto extends ModelDto {
  @ValidateIf((o) => !o._id)
  @IsDefined()
  @IsString()
  name: string

  @ValidateIf((o) => o.url !== undefined)
  @IsString()
  query: string

  table: string

  params: {
    name: string
    type: string
  }[]
}
