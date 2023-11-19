import {IsDefined, IsString, ValidateIf, IsNumber, IsArray} from 'class-validator'

import ModelDto from './../../domains/model/model.dto'

export default class PrinterDto extends ModelDto {
  @ValidateIf((o) => !o._id)
  @IsDefined()
  @IsString()
  name: string

  @ValidateIf((o) => o.origin !== undefined)
  @IsNumber()
  origin: number

  @ValidateIf((o) => o.connectionURL !== undefined)
  @IsString()
  connectionURL: string

  @ValidateIf((o) => !o._id)
  @IsDefined()
  @IsString()
  type: string

  @ValidateIf((o) => !o._id)
  @IsDefined()
  @IsNumber()
  pageWidth: number

  @ValidateIf((o) => !o._id)
  @IsDefined()
  @IsNumber()
  pageHigh: number

  @ValidateIf((o) => !o._id)
  @IsDefined()
  @IsString()
  printIn: string

  @ValidateIf((o) => o.url !== undefined)
  @IsString()
  url: string

  @ValidateIf((o) => !o._id)
  @IsDefined()
  @IsString()
  orientation: string

  @ValidateIf((o) => o.row !== undefined)
  @IsNumber()
  row: number

  @ValidateIf((o) => o.addPag !== undefined)
  @IsNumber()
  addPag: number

  quantity: number

  @ValidateIf((o) => o.fields !== undefined)
  @IsArray()
  fields: {
    type: string
    label: string
    value: string
    font: string
    fontType: string
    fontSize: number
    positionStartX: number
    positionStartY: number
    positionEndX: number
    positionEndY: number
    splitting: number
    colour: string
    position: string
  }[]


  @IsNumber()
  labelWidth: number

  @IsNumber()
  labelHigh: number
}
