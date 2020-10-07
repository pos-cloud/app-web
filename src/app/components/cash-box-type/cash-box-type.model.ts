import { IAttribute } from 'app/util/attribute.interface';
import { Model } from '../model/model.model';

export class CashBoxType extends Model {

  public name: string;

  constructor() { super(); }

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
      }
    ])
  }
}
