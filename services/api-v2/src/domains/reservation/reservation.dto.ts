import {IsDefined, IsString, ValidateIf, IsBoolean} from 'class-validator'
import * as moment from 'moment'

import ModelDto from './../../domains/model/model.dto'
import 'moment/locale/es'

export default class ReservationDto extends ModelDto {
  @ValidateIf((o) => !o._id)
  @IsDefined()
  @IsString()
  public title: string

  @ValidateIf((o) => !o._id)
  @IsDefined()
  @IsString()
  public message: string

  @ValidateIf((o) => o.devolution !== undefined)
  @IsString()
  public devolution: string

  @ValidateIf((o) => !o._id)
  @IsDefined()
  @IsString()
  @ValidateIf((o) => moment(o.startDate, 'YYYY-MM-DDTHH:mm:ssZ').isValid())
  public startDate: string

  @ValidateIf((o) => !o._id)
  @IsDefined()
  @IsString()
  @ValidateIf((o) => moment(o.endDate, 'YYYY-MM-DDTHH:mm:ssZ').isValid())
  public endDate: string

  @ValidateIf((o) => !o._id)
  @IsDefined()
  @IsString()
  public state: string

  @ValidateIf((o) => !o._id)
  @IsDefined()
  @IsBoolean()
  public fixed: boolean

  @ValidateIf((o) => !o._id)
  @IsDefined()
  @IsBoolean()
  public allDay: boolean
}
