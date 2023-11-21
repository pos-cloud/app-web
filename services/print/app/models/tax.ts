import Tax from './taxes'

export default interface Taxes {
  // _id: any;
  tax: Tax
  percentage: number
  taxBase: number
  taxAmount: number
}
