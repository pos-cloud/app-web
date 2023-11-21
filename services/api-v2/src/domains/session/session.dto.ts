import {IsDefined, IsString, ValidateIf} from 'class-validator'
import * as moment from 'moment'

import ModelDto from './../../domains/model/model.dto'
import 'moment/locale/es'

export default class SessionDto extends ModelDto {
  @ValidateIf((o) => !o._id)
  @IsDefined()
  @IsString()
  public type: string

  @ValidateIf((o) => !o._id)
  @IsDefined()
  @IsString()
  public state: string

  @ValidateIf((o) => !o._id)
  @IsDefined()
  @IsString()
  @ValidateIf((o) => moment(o.date, 'YYYY-MM-DDTHH:mm:ssZ').isValid())
  public date: string
}
