import {IsDefined, IsString, ValidateIf, IsNumber} from 'class-validator'
import * as moment from 'moment'

import ModelDto from './../../domains/model/model.dto'
import 'moment/locale/es'

export default class VoucherDto extends ModelDto {
  @ValidateIf((o) => !o._id)
  @IsDefined()
  @IsString()
  @ValidateIf((o) => moment(o.date, 'YYYY-MM-DDTHH:mm:ssZ').isValid())
  public date: string

  @ValidateIf((o) => !o._id)
  @IsDefined()
  @IsString()
  public token: string

  @ValidateIf((o) => o.readings !== undefined)
  @IsNumber()
  public readings: number

  @ValidateIf((o) => !o._id)
  @IsDefined()
  @IsString()
  @ValidateIf((o) => moment(o.expirationDate, 'YYYY-MM-DDTHH:mm:ssZ').isValid())
  public expirationDate: string
}
