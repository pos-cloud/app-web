import { User } from '../user/user';

export class Model {

  public _id: string;
  public creationDate: string;
  public updateDate: string;
  public creationUser: User;
  public updateUser: User;
  public operationType: string;

  constructor() { }

  static getAttributes(
    atrributes: {
      name: string,
      visible: boolean,
      disabled: boolean,
      filter: boolean,
      defaultFilter: string,
      datatype: string,
      project: any,
      align: string,
      required: boolean
    }[]
  ): {
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
    return [
      ...atrributes,
      {
        name: 'creationDate',
        visible: false,
        disabled: false,
        filter: true,
        defaultFilter: null,
        datatype: 'date',
        project: null,
        align: 'left',
        required: false
      },
      {
        name: 'creationUser.name',
        visible: false,
        disabled: false,
        filter: true,
        defaultFilter: null,
        datatype: 'date',
        project: null,
        align: 'left',
        required: false,
      },
      {
        name: 'updateDate',
        visible: false,
        disabled: false,
        filter: true,
        defaultFilter: null,
        datatype: 'date',
        project: null,
        align: 'left',
        required: false,
      },
      {
        name: 'updateUser.name',
        visible: false,
        disabled: false,
        filter: true,
        defaultFilter: null,
        datatype: 'date',
        project: null,
        align: 'left',
        required: false,
      },
      {
        name: 'operationType',
        visible: false,
        disabled: true,
        filter: false,
        defaultFilter: `{ "$ne": "D" }`,
        datatype: 'string',
        project: null,
        align: 'left',
        required: true,
      }
    ]
  }
}
