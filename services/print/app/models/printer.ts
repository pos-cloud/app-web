import Model from "./model"
export default interface Printer extends Model {
  name: string
  origin: number
  connectionURL: string
  type: string
  pageWidth: number
  pageHigh: number
  labelWidth: number
  labelHigh: number
  printIn: string
  url: string
  orientation: string
  row: number
  addPag: number
  quantity: number
  fields: [
    {
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
    },
  ]
}
