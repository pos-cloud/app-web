import {IsDefined, ValidateIf, IsString} from 'class-validator'
import * as moment from 'moment'

import CashBox from './../../domains/cash-box/cash-box.interface'
import ModelDto from './../../domains/model/model.dto'
import PaymentMethod from './../../domains/payment-method/payment-method.interface'
import 'moment/locale/es'

export default class MovementOfCashBoxDto extends ModelDto {
  @ValidateIf((o) => !o._id)
  @IsDefined()
  @IsString()
  @ValidateIf((o) => moment(o.opening, 'YYYY-MM-DDTHH:mm:ssZ').isValid())
  public opening: string

  @ValidateIf((o) => !o._id)
  @IsDefined()
  @IsString()
  @ValidateIf((o) => moment(o.closing, 'YYYY-MM-DDTHH:mm:ssZ').isValid())
  public closing: string

  @ValidateIf((o) => !o._id)
  @IsDefined()
  public paymentMethod: PaymentMethod

  @ValidateIf((o) => !o._id)
  @IsDefined()
  public cashBox: CashBox
}
