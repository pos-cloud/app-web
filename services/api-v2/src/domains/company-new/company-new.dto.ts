import {IsDefined, IsString, ValidateIf} from 'class-validator'
import * as moment from 'moment'

import Company from './../../domains/company/company.interface'
import ModelDto from './../../domains/model/model.dto'
import 'moment/locale/es'

export default class CompanyNewDto extends ModelDto {
  @ValidateIf((o) => !o._id)
  @IsDefined()
  @IsString()
  @ValidateIf((o) => moment(o.date, 'YYYY-MM-DDTHH:mm:ssZ').isValid())
  public date: string

  @ValidateIf((o) => !o._id)
  @IsDefined()
  @IsString()
  public news: string

  @ValidateIf((o) => o.state !== undefined)
  @IsString()
  public state: string

  @ValidateIf((o) => !o._id)
  @IsDefined()
  public company: Company
}
