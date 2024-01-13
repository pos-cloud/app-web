import {IAttribute} from 'app/util/attribute.interface';

import {Company} from '../company/company';
import {Model} from '../model/model.model';

export class Address extends Model {
  public type: string;
  public name: string;
  public number: string;
  public floor: string;
  public flat: string;
  public postalCode: string;
  public city: string;
  public state: string;
  public country: string = 'Argentina';
  public latitude: string;
  public longitude: string;
  public observation: string;
  public company: Company;
  public forBilling: boolean = true;
  public forShipping: boolean = true;
  public shippingStatus: string;

  constructor() {
    super();
  }

  static getAttributes(): IAttribute[] {
    return Model.getAttributes([
      {
        name: 'type',
        visible: true,
        filter: true,
        datatype: 'string',
        align: 'left',
      },
      {
        name: 'name',
        visible: true,
        filter: true,
        datatype: 'string',
        align: 'left',
      },
      {
        name: 'number',
        visible: true,
        filter: true,
        datatype: 'string',
        align: 'left',
      },
      {
        name: 'floor',
        visible: true,
        filter: true,
        datatype: 'string',
        align: 'left',
      },
      {
        name: 'flat',
        visible: true,
        filter: true,
        datatype: 'string',
        align: 'left',
      },
      {
        name: 'postalCode',
        visible: true,
        filter: true,
        datatype: 'string',
        align: 'left',
      },
      {
        name: 'city',
        visible: true,
        filter: true,
        datatype: 'string',
        align: 'left',
      },
      {
        name: 'state',
        visible: true,
        filter: true,
        datatype: 'string',
        align: 'left',
      },
      {
        name: 'country',
        visible: true,
        filter: true,
        datatype: 'string',
        align: 'left',
      },
      {
        name: 'latitude',
        visible: true,
        filter: true,
        datatype: 'string',
        align: 'left',
      },
      {
        name: 'longitude',
        visible: true,
        filter: true,
        datatype: 'string',
        align: 'left',
      },
      {
        name: 'observation',
        visible: true,
        filter: true,
        datatype: 'string',
        align: 'left',
      },
      {
        name: 'company.name',
        visible: true,
        filter: true,
        datatype: 'string',
        align: 'left',
      },
      {
        name: 'forBilling',
        visible: true,
        filter: true,
        datatype: 'boolean',
        align: 'left',
      },
      {
        name: 'forShipping',
        visible: true,
        filter: true,
        datatype: 'boolean',
        align: 'left',
      },
    ]);
  }
}
