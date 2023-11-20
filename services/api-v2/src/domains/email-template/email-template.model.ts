import MongooseModel from './../../db/mongoose-model'
import Model from './../model/model'

class EmailTemplateSchema extends Model {
  public name: string = 'email-template'

  constructor() {
    super({
      name: { type: String, trim: true, required: true },
      design: { type: String, required: true },
    })
  }

  public getPath(): string {
    return '/email-templates'
  }

  public getInstance(database: string) {
    return new (new MongooseModel(this, database).getModel(this.name))()
  }
}

export interface bodyMail {
  from: string
  to: string
  subject: string
  html: string,
  attachments: string
}

export interface connectionMail {
  host: string,
  port: number,
  auth: {
    user: string,
    pass: string
  }
}

export default new EmailTemplateSchema()
