import {
  IsDefined,
  IsString,
  ValidateIf,
  IsBoolean,
  IsArray,
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
  IsNumber,
} from 'class-validator'
import Account from 'domains/account/account.interface'
import * as moment from 'moment'

import CompanyGroup from './../../domains/company-group/company-group.interface'
import Country from './../../domains/country/country.interface'
import Employee from './../../domains/employee/employee.interface'
import IdentificationType from './../../domains/identification-type/identification-type.interface'
import ModelDto from './../../domains/model/model.dto'
import PriceList from './../../domains/price-list/price-list.interface'
import State from './../../domains/state/state.interface'
import Transport from './../../domains/transport/transport.interface'
import VATCondition from './../../domains/vat-condition/vat-condition.interface'
import {CompanyType} from './company.interface'

export default class CompanyDto extends ModelDto {
  @ValidateIf((o) => !o._id)
  @IsDefined()
  @IsString()
  public name: string

  @ValidateIf((o) => o.fantasyName !== undefined)
  @IsString()
  public fantasyName: string

  @ValidateIf((o) => !o._id)
  @IsDefined()
  @IsString()
  public type: CompanyType

  @ValidateIf((o) => o.category !== undefined)
  @IsString()
  public category: string

  @ValidateIf((o) => !o._id)
  @IsDefined()
  vatCondition: VATCondition

  @ValidateIf((o) => !o._id)
  @IsDefined()
  identificationType: IdentificationType

  @ValidateIf((o) => o.identificationValue !== undefined)
  @IsString()
  @IsValidateCuit()
  @ValidateIf((o) => !o._id)
  @IsDefined()
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

  @ValidateIf((o) => o.birthday !== undefined)
  @IsString()
  @ValidateIf((o) => moment(o.birthday, 'YYYY-MM-DDTHH:mm:ssZ').isValid())
  public birthday: string

  @ValidateIf((o) => o.gender !== undefined)
  @IsString()
  public gender: string

  @ValidateIf((o) => o.observation !== undefined)
  @IsString()
  public observation: string

  @IsBoolean()
  public allowCurrentAccount: boolean

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

  @ValidateIf((o) => o.otherFields !== undefined)
  @IsArray()
  public otherFields: []

  public group: CompanyGroup

  public employee: Employee

  public transport: Transport

  public priceList: PriceList

  @ValidateIf((o) => o.latitude !== undefined)
  @IsString()
  public latitude: string

  @ValidateIf((o) => o.latitude !== undefined)
  @IsString()
  public longitude: string

  @ValidateIf((o) => o.discount !== undefined)
  @IsNumber()
  public discount: number

  public account: Account

  @ValidateIf((o) => o.wooId !== undefined)
  @IsString()
  public wooId: string

  @ValidateIf((o) => o.meliId !== undefined)
  @IsString()
  public meliId: string

  public creditLimit: number
  public zipCode: string
}

export function IsValidateCuit(validationOptions?: ValidationOptions) {
  return (object: any, propertyName: string) => {
    registerDecorator({
      name: 'IsValidateCuit',
      target: object.constructor,
      propertyName,
      constraints: [],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          let result = false

          if (value.length != 11) {
            return result
          }
          let acumulado = 0
          let digitos = value.split('')
          let digito = digitos.pop()

          for (let i = 0; i < digitos.length; i++) {
            acumulado += digitos[9 - i] * (2 + (i % 6))
          }
          let verif = 11 - (acumulado % 11)

          if (verif == 11) {
            verif = 0
            result = true
          }

          return result
        },
      },
    })
  }
}
