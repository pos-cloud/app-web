import {IAttribute} from 'app/util/attribute.interface';

import {Article} from '../article/article';
import {Model} from '../model/model.model';

export class BusinessRule extends Model {
  _id: string;
  code: string;
  name: string;
  description: string;
  termsAndConditions: string;
  startDate: Date;
  endDate: Date;
  minAmount: number;
  minQuantity: number;
  transactionAmountLimit: number;
  totalStock: number;
  currentStock: number;
  madeIn: string;
  active: boolean;
  discountType: DiscountType;
  discountValue: number;
  article: Article;
  item: Article;

  constructor() {
    super();
  }

  static getAttributes(): IAttribute[] {
    return Model.getAttributes([
      {
        name: 'code',
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
        name: 'startDate',
        visible: true,
        filter: true,
        project: `{ "$dateToString": { "date": "$startDate", "format": "%d/%m/%Y", "timezone": "-03:00" } }`,
        datatype: 'string',
        align: 'left',
      },
      {
        name: 'endDate',
        visible: true,
        filter: true,
        project: `{ "$dateToString": { "date": "$endDate", "format": "%d/%m/%Y", "timezone": "-03:00" } }`,
        datatype: 'string',
        align: 'left',
      },
      {
        name: 'active',
        visible: true,
        filter: true,
        datatype: 'boolean',
        align: 'left',
      },
      {
        name: 'currentStock',
        visible: true,
        filter: true,
        datatype: 'number',
        align: 'right',
      },
      {
        name: 'description',
        visible: false,
        filter: true,
        required: true,
        datatype: 'string',
        align: 'left',
      },
    ]);
  }
}

export enum DiscountType {
  Percentage = 'percentage',
  Amount = 'amount',
}

export enum Types {
  Asset = <any>'Activo',
  Passive = <any>'Pasivo',
  netWorth = <any>'Patrimonio Neto',
  Result = <any>'Resultado',
  Compensatory = <any>'Compensatoria',
  Other = <any>'Otro',
}

export enum Modes {
  Synthetic = <any>'Sintetico',
  Analytical = <any>'Analitico',
}
