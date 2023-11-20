import {IsDefined, IsString, IsEmail, ValidateIf} from 'class-validator'

import ModelDto from './../../domains/model/model.dto'

export default class ClaimDto extends ModelDto {
  @ValidateIf((o) => !o._id)
  @IsDefined()
  @IsString()
  public name: string

  @ValidateIf((o) => !o._id)
  @IsDefined()
  @IsString()
  public description: string

  @ValidateIf((o) => !o._id)
  @IsDefined()
  @IsString()
  public type: string

  @ValidateIf((o) => !o._id)
  @IsDefined()
  @IsString()
  public priority: string

  @ValidateIf((o) => !o._id)
  @IsDefined()
  @IsString()
  public author: string

  @ValidateIf((o) => !o._id)
  @IsDefined()
  @IsString()
  @IsEmail()
  public email: string

  @ValidateIf((o) => !o._id)
  @IsDefined()
  @IsString()
  public listName: string

  @ValidateIf((o) => o.file !== undefined)
  @IsString()
  public file: string
}
