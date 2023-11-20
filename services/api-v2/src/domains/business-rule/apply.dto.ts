import {IsDefined, IsString} from 'class-validator'

export default class ApplyBusinessRuleDto {
  @IsDefined()
  @IsString()
  code: string

  @IsDefined()
  @IsString()
  transactionId: string
}
