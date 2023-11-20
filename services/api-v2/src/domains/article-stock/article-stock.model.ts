import {Schema} from 'mongoose'

import MongooseModel from './../../db/mongoose-model'
import Model from './../model/model'

class ArticleStockSchema extends Model {
  public name: string = 'article-stock'

  constructor() {
    super({
      article: {type: Schema.Types.ObjectId, ref: 'article', required: true},
      branch: {type: Schema.Types.ObjectId, ref: 'branch', required: true},
      deposit: {type: Schema.Types.ObjectId, ref: 'deposit', required: true},
      realStock: {type: Number, default: 0, required: true},
      minStock: {type: Number, default: 0},
      maxStock: {type: Number, default: 0},
    })
  }

  public getPath(): string {
    return '/article-stocks'
  }

  public getInstance(database: string) {
    return new (new MongooseModel(this, database).getModel(this.name))()
  }
}

export default new ArticleStockSchema()
