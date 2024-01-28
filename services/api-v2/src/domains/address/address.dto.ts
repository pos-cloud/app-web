import {IsDefined, IsString, ValidateIf, IsBoolean} from 'class-validator'

import Company from './../../domains/company/company.interface'
import ModelDto from './../../domains/model/model.dto'
import { ShippingStatus } from './address.interface'

export default class AddressDto extends ModelDto {
  @ValidateIf((o) => o.type !== undefined)
  @IsString()
  public type: string

  @ValidateIf((o) => !o._id)
  @IsDefined()
  @IsString()
  public name: string

  @ValidateIf((o) => o.number !== undefined)
  @IsString()
  public number: string

  @ValidateIf((o) => o.floor !== undefined)
  @IsString()
  public floor: string

  @ValidateIf((o) => o.flat !== undefined)
  @IsString()
  public flat: string

  @ValidateIf((o) => o.postalCode !== undefined)
  @IsString()
  public postalCode: string

  @ValidateIf((o) => o.city !== undefined)
  @IsString()
  public city: string

  @ValidateIf((o) => o.state !== undefined)
  @IsString()
  public state: string

  @ValidateIf((o) => o.country !== undefined)
  @IsString()
  public country: string

  @ValidateIf((o) => o.latitude !== undefined)
  @IsString()
  public latitude: string

  @ValidateIf((o) => o.longitude !== undefined)
  @IsString()
  public longitude: string

  @ValidateIf((o) => o.observation !== undefined)
  @IsString()
  public observation: string

  @ValidateIf((o) => o.forBilling !== undefined)
  @IsBoolean()
  public forBilling: boolean

  @ValidateIf((o) => o.forShipping !== undefined)
  @IsBoolean()
  public forShipping: boolean

  @ValidateIf((o) => !o._id)
  @IsDefined()
  public company: Company

  @ValidateIf((o) => o.shippingStatus !== undefined)
  @IsString()
  public shippingStatus: ShippingStatus
}
