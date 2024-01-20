import * as axios from 'axios'
import Responseable from 'interfaces/responsable.interface'

import {ArticleFieldType} from './../../domains/article-field/article-field.interface'
import FileUC from './../../domains/file/file.uc'
import MovementOfArticleController from './../../domains/movement-of-article/movement-of-article.controller'
import MovementOfArticle from './../../domains/movement-of-article/movement-of-article.interface'
import StructureController from './../../domains/structure/structure.controller'
import Structure from './../../domains/structure/structure.interface'
import {PriceType} from './../../domains/transaction-type/transaction-type.interface'
import MercadoLibreController from './../../domains/uc/mercadolibre.controller'
import WooCommerceController from './../../domains/uc/woocomerce.controller'
import VariantController from './../../domains/variant/variant.controller'
import Variant from './../../domains/variant/variant.interface'
import Responser from './../../utils/responser'
import ArticleStockController from './article-stock.controller'

export default class ArticleStockUC {
  database: string
  articleStockController: ArticleStockController
  api: any
  authToken: string

  constructor(database: string, authToken?: string) {
    this.database = database
    this.authToken = authToken
    this.articleStockController = new ArticleStockController(database)
  }

  updateFromExel = async () => {
        
  }


}
