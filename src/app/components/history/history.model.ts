import { IAttribute } from 'app/util/attribute.interface';
import { Model } from '../model/model.model';

export class History extends Model {

  constructor() { super(); }

  static getAttributes(): IAttribute[] {
    return Model.getAttributes([
      {
        name: 'collectionName',
        visible: true,
        disabled: false,
        filter: true,
        defaultFilter: null,
        datatype: 'string',
        project: null,
        align: 'left',
        required: false,
      },
      {
        name: 'doc._id',
        visible: true,
        disabled: false,
        filter: true,
        defaultFilter: null,
        datatype: 'string',
        project: `{ "$toString": "$doc._id" }`,
        align: 'left',
        required: false,
      },
      {
        name: 'name',
        visible: true,
        disabled: false,
        filter: true,
        defaultFilter: null,
        datatype: 'string',
        project: '"$doc.name"',
        align: 'left',
        required: false,
      },
      {
        name: 'origin',
        visible: false,
        disabled: false,
        filter: true,
        defaultFilter: null,
        datatype: 'number',
        project: '"$doc.origin"',
        align: 'right',
        required: false,
      },
      {
        name: 'letter',
        visible: false,
        disabled: false,
        filter: true,
        defaultFilter: null,
        datatype: 'string',
        project: '"$doc.letter"',
        align: 'left',
        required: false,
      },
      {
        name: 'number',
        visible: true,
        disabled: false,
        filter: true,
        defaultFilter: null,
        datatype: 'number',
        project: '"$doc.number"',
        align: 'right',
        required: false,
      },
      {
        name: '_id',
        visible: false,
        disabled: false,
        filter: true,
        defaultFilter: null,
        datatype: 'string',
        project: null,
        align: 'left',
        required: false,
      },
    ])
  }
}
