import { Make } from './make';
import { Category } from './category';
import { Taxes } from './taxes';
import { Deposit } from './deposit';
import { Location } from './location';
import { ArticleFields } from './article-fields';
import { User } from './user';
import { UnitOfMeasurement } from './unit-of-measurement';

import * as moment from 'moment';
import 'moment/locale/es';
import { Currency } from './currency';
import { Company } from './company';
import { ArticleType } from './article-type';

export class Article {

  public _id: string;
  public type: Type = Type.Final;
  public containsVariants: boolean = false;
  public code: string = "0000000001";
  public codeSAT: string;
  public description: string = '';
  public posDescription: string = '';
  public quantityPerMeasure: number = 1;
  public unitOfMeasurement: UnitOfMeasurement;
  public observation: string;
  public basePrice: number = 0.00;
  public taxes: Taxes[];
  public otherFields: ArticleFields[];
  public costPrice: number = 0.00;
  public markupPercentage: number = 0.00;
  public markupPrice: number = 0.00;
  public salePrice: number = 0.00;
  public currency: Currency;
  public make: Make;
  public deposits: [{
      _id: string;
      deposit : Deposit,
      capacity : number;	
  }];
  public locations: [{
      _id: string;
      location : Location
  }];
  public children: [{
      _id: string;
      article : Article,
      quantity : number
  }];
  public category: Category;
  public barcode: string;
  public printIn: ArticlePrintIn = ArticlePrintIn.Counter;
  public allowPurchase: Boolean = true;
  public allowSale: Boolean = true;
  public allowSaleWithoutStock: Boolean = false;
  public allowMeasure: Boolean = false;
  public isWeigth: Boolean = false;
  public ecommerceEnabled: Boolean = false;
  public favourite: Boolean = false;
  public picture: string = 'default.jpg';
  public providers : Company[];
  public classification : ArticleType;
  public operationType : string;
  public creationUser: User;
  public creationDate: string = moment().format('YYYY-MM-DDTHH:mm:ssZ');
  public updateUser: User;
  public updateDate: string;

  constructor() {}
}

export enum ArticlePrintIn {
  Bar = <any> "Bar",
  Kitchen = <any> "Cocina",
  Counter = <any> "Mostrador"
}

export enum Type {
  Final = <any>"Final",
  Variant = <any>"Variante",
  Ingredient = <any>"Ingrediente"
}

export let columns = [
  {
    name: 'code',
    visible: true,
    disabled: false,
    filter: true,
    datatype: 'string',
    align: 'left'
  },
  {
    name: 'barcode',
    visible: true,
    disabled: false,
    filter: true,
    datatype: 'string',
    align: 'left'
  },
  {
    name: 'description',
    visible: true,
    disabled: false,
    filter: true,
    datatype: 'string',
    align: 'left'
  },
  {
    name: 'posDescription',
    visible: true,
    disabled: false,
    filter: true,
    datatype: 'string',
    align: 'left'
  },
  {
    name: 'codeSAT',
    visible: false,
    disabled: false,
    filter: true,
    datatype: 'string',
    align: 'left'
  },
  {
    name: 'quantityPerMeasure',
    visible: false,
    disabled: false,
    filter: true,
    datatype: 'number',
    align: 'right'
  },
  {
    name: 'make.description',
    visible: true,
    disabled: false,
    filter: true,
    datatype: 'string',
    align: 'left'
  },
  {
    name: 'category.description',
    visible: true,
    disabled: false,
    filter: true,
    datatype: 'string',
    align: 'left'
  },
  {
    name: 'unitOfMeasurement.abbreviation',
    visible: false,
    disabled: false,
    filter: true,
    datatype: 'string',
    align: 'left'
  },
  {
    name: 'salePrice',
    visible: true,
    disabled: false,
    filter: true,
    datatype: 'currency',
    align: 'right'
  },
  {
    name: 'type',
    visible: true,
    disabled: true,
    filter: true,
    datatype: 'string',
    align: 'left'
  },
  {
    name: 'operationType',
    visible: true,
    disabled: true,
    filter: true,
    datatype: 'string',
    align: 'left'
  }
];