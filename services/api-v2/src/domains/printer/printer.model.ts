import MongooseModel from './../../db/mongoose-model'
import Model from './../model/model'

class PrinterSchema extends Model {
  public name: string = 'printer'

  constructor() {
    super({
      name: {type: String, trim: true, required: true},
      origin: {type: Number, default: 0},
      connectionURL: {type: String, trim: true},
      type: {
        type: String,
        trim: true,
        required: true,
        enum: ['PDF', 'Comandera', 'Fiscal'],
      },
      pageWidth: {type: Number, default: 297, required: true},
      pageHigh: {type: Number, default: 210, required: true},
      labelWidth: {type: Number, default: 0},
      labelHigh: {type: Number, default: 0},
      printIn: {
        type: String,
        trim: true,
        required: true,
        enum: ['Bar', 'Cocina', 'Etiqueta', 'Mostrador', 'Voucher'],
      },
      url: {type: String, trim: true},
      orientation: {type: String, trim: true, required: true},
      row: {type: Number},
      addPag: {type: Number},
      quantity: {type: Number},
      fields: [
        {
          type: {type: String, trim: true},
          label: {type: String, trim: true},
          value: {type: String, trim: true},
          font: {type: String, trim: true},
          fontType: {type: String, trim: true},
          fontSize: {type: Number},
          positionStartX: {type: Number},
          positionStartY: {type: Number},
          positionEndX: {type: Number},
          positionEndY: {type: Number},
          splitting: {type: Number},
          colour: {type: String, trim: true},
          position: {type: String, trim: true, enum: ['Encabezado', 'Cuerpo', 'Pie']},
        },
      ],
    })
  }

  public getPath(): string {
    return '/printers'
  }

  public getInstance(database: string) {
    return new (new MongooseModel(this, database).getModel(this.name))()
  }
}

export default new PrinterSchema()
