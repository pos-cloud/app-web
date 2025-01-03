import { IAttribute } from '@types';
import { Model } from '../model/model.model';

export class UnitOfMeasurement extends Model {
  public code: string = '1';
  public abbreviation: string = '';
  public name: string = '';

  constructor() {
    super();
  }

  static getAttributes(): IAttribute[] {
    return Model.getAttributes([
      {
        name: 'code',
        visible: true,
        disabled: false,
        filter: true,
        defaultFilter: null,
        datatype: 'string',
        project: null,
        align: 'right',
        required: false,
      },
      {
        name: 'abbreviation',
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
        name: 'name',
        visible: true,
        disabled: false,
        filter: true,
        defaultFilter: null,
        datatype: 'string',
        project: null,
        align: 'left',
        required: false,
      },
    ]);
  }
}
