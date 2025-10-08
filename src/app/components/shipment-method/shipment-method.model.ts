import { Application, IAttribute } from '@types';
import { Article } from '../article/article';
import { Model } from '../model/model.model';

export class ShipmentMethod extends Model {
  public name: string;
  public applications: Application[];
  public requireAddress: boolean = true;
  public requireTable: boolean = false;
  public article: Article;
  public zones: {
    name: string;
    type: ZoneType;
    cost: number;
    points: {
      lat: number;
      lng: number;
    }[];
    area: number;
  }[];
  public wooId: string;

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
        name: 'requireAddress',
        visible: true,
        disabled: false,
        filter: true,
        defaultFilter: null,
        datatype: 'boolean',
        project: null,
        align: 'left',
        required: false,
      },
      {
        name: 'requireTable',
        visible: true,
        disabled: false,
        filter: true,
        defaultFilter: null,
        datatype: 'boolean',
        project: null,
        align: 'left',
        required: false,
      },
      {
        name: 'wooId',
        visible: false,
        disabled: false,
        filter: true,
        datatype: 'string',
        project: null,
        align: 'left',
        required: false,
      },
    ]);
  }
}

export enum ZoneType {
  IN = <any>'in',
  OUT = <any>'out',
}

export interface Zone {
  name: string;
  type: ZoneType;
  cost: number;
  points: {
    lat: number;
    lng: number;
  }[];
  area: number;
}
