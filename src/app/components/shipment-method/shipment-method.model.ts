import { Model } from '../model/model.model';
import { Application } from '../application/application.model';
import { IAttribute } from 'app/util/attribute.interface';
import { Article } from '../article/article';

export class ShipmentMethod extends Model {

  public name: string;
  public applications: Application[];
  public requireAddress: boolean = true;
  public requireTable: boolean = false;
  public article: Article;
  public zones: {
    name: string,
    type: ZoneType,
    cost: number,
    points: {
      lat: number,
      lng: number
    }[],
    area: number
  }[];

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
      }, {
        name: 'requireAddress',
        visible: true,
        disabled: false,
        filter: true,
        defaultFilter: null,
        datatype: 'boolean',
        project: null,
        align: 'left',
        required: false,
      }, {
        name: 'requireTable',
        visible: true,
        disabled: false,
        filter: true,
        defaultFilter: null,
        datatype: 'boolean',
        project: null,
        align: 'left',
        required: false,
      }
    ])
  }
}

export enum ZoneType {
  IN = <any>"in",
  OUT = <any>"out"
}
