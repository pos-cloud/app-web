import {Schema} from 'mongoose'

export default class Model extends Schema {
  public name: string

  constructor(schema: {}) {
    super({
      ...schema,
      creationUser: {type: Schema.Types.ObjectId, ref: 'user'},
      creationDate: {type: Date},
      operationType: {type: String, trim: true},
      updateUser: {type: Schema.Types.ObjectId, ref: 'user'},
      updateDate: {type: Date},
      audits: [
        {
          date: {type: Date},
          user: {
            ref: 'user',
            type: Schema.Types.ObjectId,
          },
        },
      ],
    })
  }
}
