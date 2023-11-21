import Model from "./model"

export default interface Bank extends Model {
  code: number
  agency: number
//   account: Account
  name: string
}
