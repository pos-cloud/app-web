import {IsDefined, IsNumber, IsString, ValidateIf, IsBoolean} from 'class-validator'

import CompanyGroup from './../../domains/company-group/company-group.interface'
import Country from './../../domains/country/country.interface'
import IdentificationType from './../../domains/identification-type/identification-type.interface'
import ModelDto from './../../domains/model/model.dto'
import State from './../../domains/state/state.interface'
import VATCondition from './../../domains/vat-condition/vat-condition.interface'

export default class TransportDto extends ModelDto {
  @ValidateIf((o) => !o._id)
  @IsDefined()
  @IsNumber()
  public code: number

  @ValidateIf((o) => !o._id)
  @IsDefined()
  @IsString()
  public name: string

  @ValidateIf((o) => o.fantasyName !== undefined)
  @IsString()
  public fantasyName: string

  @ValidateIf((o) => !o._id)
  @IsDefined()
  vatCondition: VATCondition

  identificationType: IdentificationType

  @ValidateIf((o) => o.identificationValue !== undefined)
  @IsString()
  public identificationValue: string

  @ValidateIf((o) => o.grossIncome !== undefined)
  @IsString()
  public grossIncome: string

  @ValidateIf((o) => o.address !== undefined)
  @IsString()
  public address: string

  @ValidateIf((o) => o.city !== undefined)
  @IsString()
  public city: string

  @ValidateIf((o) => o.phones !== undefined)
  @IsString()
  public phones: string

  @ValidateIf((o) => o.emails !== undefined)
  @IsString()
  public emails: string

  @ValidateIf((o) => o.observation !== undefined)
  @IsString()
  public observation: string

  @IsDefined()
  @IsBoolean()
  public allowCurrentAccount: string

  public country: Country

  @ValidateIf((o) => o.floorNumber !== undefined)
  @IsString()
  public floorNumber: string

  @ValidateIf((o) => o.flat !== undefined)
  @IsString()
  public flat: string

  public state: State

  @ValidateIf((o) => o.addressNumber !== undefined)
  @IsString()
  public addressNumber: string

  public group: CompanyGroup
}
