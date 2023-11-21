import Article from "./article"
import Model from "./model"

export default interface PaymentMethod extends Model {
    order: number
    code: number
    name: string
    discount: number
    discountArticle?: Article
    surcharge: number
    surchargeArticle?: Article
    commission?: number
    commissionArticle?: Article
    administrativeExpense?: number
    administrativeExpenseArticle?: Article
    otherExpense?: number
    otherExpenseArticle?: Article
    isCurrentAccount: boolean
    acceptReturned: boolean
    inputAndOuput: boolean
    checkDetail: boolean
    checkPerson: boolean
    cardDetail: boolean
    allowToFinance: boolean
    payFirstQuota: boolean
    cashBoxImpact: boolean
    company: string
    bankReconciliation: boolean
    // currency: Currency
    allowCurrencyValue: boolean
    allowBank: boolean
    observation: string
    mercadopagoAPIKey: string
    mercadopagoClientId: string
    mercadopagoAccessToken: string
    whatsappNumber: string
    // applications: Application[]
    // account: Account
    expirationDays: number
  }
  