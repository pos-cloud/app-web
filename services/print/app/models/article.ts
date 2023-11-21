import Make from "./make"
import Model from "./model"

export default interface Article extends Model {
  creationDate: string
  //creationUser: User
  type: string
  order: number
  containsVariants: boolean
  containsStructure: boolean
  code: string
  codeProvider: string
  codeSAT: string
  description: string
  url: string
  posDescription: string
  quantityPerMeasure: string
  //unitOfMeasurement: UnitOfMeasurement
  observation: string
  notes: []
  tags: []
  basePrice: number
  otherFields: {
    //articleField: ArticleField
    value: string
    amount: number
  }[]
  //taxes: Taxes[]
  costPrice: number
  markupPercentage: number
  markupPrice: number
  salePrice: number
  //currency: Currency
  make: Make
  //category: Category
  deposits: {
   // deposit: Deposit
    capacity: number
  }[]
  locations: {
    location: Location
  }[]
  children: {
    article: Article
    quantity: number
  }[]
  pictures: {
    wooId?: string
    meliId?: string
    picture: string
  }[]
  barcode: string
  wooId: string
  meliId: string
  //meliAttrs: IMeliAttrs
  printIn: string
  posKitchen: boolean
  allowPurchase: boolean
  allowSale: boolean
  allowStock: boolean
  allowSaleWithoutStock: boolean
  allowMeasure: boolean
  ecommerceEnabled: boolean
  favourite: boolean
  isWeigth: boolean
  forShipping: boolean
  picture: string
  providers: []
  //provider: Company
  //applications: Application[]
  //classification: Classification
  harticle: Article
  //salesAccount: Account
  //purchaseAccount: Account
  minStock: Number
  maxStock: Number
  pointOfOrder: Number
  purchasePrice: Number
  costPrice2: Number
}
