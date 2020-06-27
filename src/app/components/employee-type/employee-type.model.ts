import { Model } from '../model/model.model';

export class EmployeeType extends Model {

  public description: string;

  constructor() { super(); }

  static getAttributes(): {
    name: string,
    visible: boolean,
    disabled: boolean,
    filter: boolean,
    defaultFilter: string,
    datatype: string,
    project: any,
    align: string,
    required: boolean
  }[] {
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
