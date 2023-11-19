import CashBox from './../../domains/cash-box/cash-box.interface'
import Model from './../../domains/model/model.interface'
import PaymentMethod from './../../domains/payment-method/payment-method.interface'

export default interface MovementOfCashBoxDto extends Model {
  opening: string
  closing: string
  paymentMethod: PaymentMethod
  cashBox: CashBox
}
