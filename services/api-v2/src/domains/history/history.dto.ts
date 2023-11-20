import {IsDefined, IsString, ValidateIf} from 'class-validator'

import ModelDto from './../../domains/model/model.dto'

export default class ClientDto extends ModelDto {
  @ValidateIf((o) => !o._id)
  @IsDefined()
  @IsString()
  public collectionName: string

  @ValidateIf((o) => !o._id)
  @IsDefined()
  public doc: any
}
