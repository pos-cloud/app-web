import { User } from '../user/user';

import * as moment from 'moment';
import { Application } from '../application/application.model';

export class Make {

  public _id: string;
  public description: string = '';
  public visibleSale: boolean = false;
  public ecommerceEnabled: boolean = false;
  public applications: Application[];
  public picture: string;
  public creationUser: User;
  public creationDate: string = moment().format('YYYY-MM-DDTHH:mm:ssZ');
  public updateUser: User;
  public updateDate: string;

  constructor() {  }

}

export let attributes = [
  {
    name: 'description',
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
  }
]
