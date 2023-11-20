import {ValidateIf, IsString} from 'class-validator'
import * as moment from 'moment'

import User from './../user/user.interface'
import 'moment/locale/es'

export default class ModelDto {
  _id: string

  creationUser: User

  @ValidateIf((o) => o.creationDate !== undefined)
  @IsString()
  @ValidateIf((o) => moment(o.creationDate, 'YYYY-MM-DDTHH:mm:ssZ').isValid())
  creationDate: string

  operationType: String

  updateUser: User

  @ValidateIf((o) => o.updateDate !== undefined)
  @IsString()
  @ValidateIf((o) => moment(o.updateDate, 'YYYY-MM-DDTHH:mm:ssZ').isValid())
  updateDate: string

  audits: {
    user: User
    date: string
  }[]
}
