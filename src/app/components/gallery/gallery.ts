import { User } from '../user/user';

import * as moment from 'moment';
import 'moment/locale/es';
import { Resource } from '../resource/resource';

export class Gallery {
  public _id: string;
  public name: string = '';
  public colddown: number;
  public barcode: boolean = false;
  public resources: [
    {
      resource: Resource;
      order: number;
    }
  ];
  public creationDate: string = moment().format('YYYY-MM-DDTHH:mm:ssZ');
  public updateUser: User;
  public updateDate: string;

  constructor() {}
}
export let attributes = [
  {
    name: 'name',
    visible: true,
    disabled: false,
    filter: true,
    datatype: 'string',
    project: null,
    align: 'left',
    required: false,
  },
  {
    name: 'colddown',
    visible: false,
    disabled: false,
    filter: true,
    datatype: 'number',
    project: null,
    align: 'right',
    required: false,
  },
  {
    name: 'barcode',
    visible: true,
    disabled: false,
    filter: true,
    datatype: 'string',
    project: null,
    align: 'left',
    required: false,
  },
  {
    name: 'creationDate',
    visible: false,
    disabled: false,
    filter: true,
    datatype: 'date',
    project: `{ "$dateToString": { "date": "$creationDate", "format": "%d/%m/%Y %H:%M", "timezone": "-03:00" } }`,
    align: 'left',
    required: false,
  },
  {
    name: 'updateDate',
    visible: false,
    disabled: false,
    filter: true,
    datatype: 'string',
    project: `{ "$dateToString": { "date": "$updateDate", "format": "%d/%m/%Y %H:%M", "timezone": "-03:00" } }`,
    align: 'left',
    required: false,
  },
  {
    name: 'operationType',
    visible: false,
    disabled: true,
    filter: false,
    datatype: 'string',
    defaultFilter: `{ "$ne": "D" }`,
    project: null,
    align: 'left',
    required: true,
  },
];
