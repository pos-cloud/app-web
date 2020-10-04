import { User } from '../user/user';
import * as moment from 'moment';

export class Model {

  public _id: string;
  public audits: [
    {
      date: string,
      user: User
    }
  ];
  public creationDate: string = moment().format('YYYY-MM-DDTHH:mm:ssZ');;
  public updateDate: string = moment().format('YYYY-MM-DDTHH:mm:ssZ');;
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
        name: '_id',
        visible: false,
        disabled: false,
        filter: true,
        defaultFilter: null,
        datatype: 'string',
        project: null,
        align: 'left',
        required: false
      },
      {
        name: 'creationDate',
        visible: false,
        disabled: false,
        filter: true,
        defaultFilter: null,
        datatype: 'string',
        project: `{ "$dateToString": { "date": "$creationDate", "format": "%d/%m/%Y", "timezone": "-03:00" } }`,
        align: 'left',
        required: false
      },
      {
        name: 'creationUser.name',
        visible: false,
        disabled: false,
        filter: true,
        defaultFilter: null,
        datatype: 'string',
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
        datatype: 'string',
        project: `{ "$dateToString": { "date": "$updateDate", "format": "%d/%m/%Y", "timezone": "-03:00" } }`,
        align: 'left',
        required: false,
      },
      {
        name: 'updateUser.name',
        visible: false,
        disabled: false,
        filter: true,
        defaultFilter: null,
        datatype: 'string',
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
