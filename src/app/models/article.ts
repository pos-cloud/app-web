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

export class Article {

  public _id: string;
  public type: ArticleType = ArticleType.Final;
  public containsVariants: boolean = false;
  public code: string = "00001";
  public codeSAT: string;
  public description: string = '';
  public posDescription: string = '';
  public variantDescription: string;
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
  public make: Make;
  public deposit: Deposit;
  public location: Location;
  public category: Category;
  public barcode: string;
  public printIn: ArticlePrintIn = ArticlePrintIn.Counter;
  public allowPurchase: Boolean = true;
  public allowSale: Boolean = true;
  public allowSaleWithoutStock: Boolean = false;
  public allowMeasure: Boolean = false;
  public ecommerceEnabled: Boolean = false;
  public favourite: Boolean = false;
  public printed: boolean;
  public picture: string = 'default.jpg';
  public creationUser: User;
  public creationDate: string = moment().format('YYYY-MM-DDTHH:mm:ssZ');
  public updateUser: User;
  public updateDate: string = moment().format('YYYY-MM-DDTHH:mm:ssZ');

  constructor() {}
}

export enum ArticlePrintIn {
  Bar = <any> "Bar",
  Kitchen = <any> "Cocina",
  Counter = <any> "Mostrador"
}

export enum ArticleType {
  Final = <any>"Final",
  Variant = <any>"Variante",
  Ingredient = <any>"Ingrediente"
}
