import { IAttribute } from '@types';
import 'moment/locale/es';
import { Model } from '../model/model.model';

export class Holiday extends Model {
  public name: string;
  public date: Date;

  constructor() {
    super();
  }

  static getAttributes(): IAttribute[] {
    return Model.getAttributes([
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
      {
        name: 'date',
        visible: true,
        disabled: false,
        filter: true,
        defaultFilter: null,
        datatype: 'date',
        project: null,
        align: 'left',
        required: false,
      },
    ]);
  }
}
