import { IAttribute } from 'app/util/attribute.interface';
import { Model } from '../model/model.model';

export class EmployeeType extends Model {

  public description: string;

  constructor() { super(); }

  static getAttributes(): IAttribute[] {
    return Model.getAttributes([
      {
        name: 'description',
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
