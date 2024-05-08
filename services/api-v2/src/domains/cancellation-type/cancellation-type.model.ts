import {Schema} from 'mongoose'

import MongooseModel from './../../db/mongoose-model'
import Model from './../model/model'

class CancellationTypeSchema extends Model {
  public name: string = 'cancellation-type'

  constructor() {
    super({
      origin: {type: Schema.Types.ObjectId, ref: 'transaction-type', required: true},
      destination: {type: Schema.Types.ObjectId, ref: 'transaction-type', required: true},
      automaticSelection: {type: Boolean, default: true},
      modifyBalance: {type: Boolean, default: true},
      requestAutomatic: {type: Boolean, default: false},
      requestCompany: {type: Boolean, default: true},
      requestStatusOrigin: {type: String, default: 'Cerrado', required: true},
      stateOrigin: {
        type: String,
        trim: true,
        required: true,
        enum: [
          'Armando',
          'Cerrado',
          'Entregado',
          'Enviado',
          'Pago Confirmado',
          'Pago Rechazado',
          'Pendiente de pago',
          'Preparando',
        ],
      },
      updatePrices: {type: Boolean, default: false},
      cancelByArticle: {type: Boolean, default: false}
    })
  }

  public getPath(): string {
    return '/cancellation-types'
  }

  public getInstance(database: string) {
    return new (new MongooseModel(this, database).getModel(this.name))()
  }
}

export default new CancellationTypeSchema()
