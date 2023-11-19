import MongooseModel from './../../db/mongoose-model'
import Model from './../model/model'

class ArticleFieldSchema extends Model {
  public name: string = 'article-field'

  constructor() {
    super({
      order: {type: Number, default: 1, required: true},
      name: {type: String, trim: true, required: true},
      datatype: {type: String, trim: true, required: true},
      value: {type: String, trim: true, required: true},
      modify: {type: Boolean, default: false},
      modifyVAT: {type: Boolean, default: false},
      discriminateVAT: {type: Boolean, default: false},
      ecommerceEnabled: {type: Boolean, default: false},
      wooId: {type: String},
    })
  }

  public getPath(): string {
    return '/article-fields'
  }

  public getInstance(database: string) {
    return new (new MongooseModel(this, database).getModel(this.name))()
  }
}

export default new ArticleFieldSchema()
