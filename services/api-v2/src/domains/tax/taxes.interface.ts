import Tax from './tax.interface'

export default interface Taxes {
  // _id: any;
  tax: Tax
  percentage: number
  taxBase: number
  taxAmount: number
}
