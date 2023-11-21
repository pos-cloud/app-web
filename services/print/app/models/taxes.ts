import Model from "./model"

export default interface Tax extends Model {
  code: string
  name: string
  taxBase: TaxBase
  percentage: number
  amount: number
  classification: TaxClassification
  type: TaxType
  lastNumber: number
//   debitAccount: Account
//   creditAccount: Account
}

export enum TaxBase {
  None = <any>'',
  Neto = <any>'Gravado',
}

export enum TaxClassification {
  None = <any>'',
  Tax = <any>'Impuesto',
  Withholding = <any>'Retención',
  Perception = <any>'Percepción',
}

export enum TaxType {
  None = <any>'',
  National = <any>'Nacional',
  State = <any>'Provincial',
  City = <any>'Municipal',
}
