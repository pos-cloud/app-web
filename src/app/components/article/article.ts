import { ArticleFields } from '../article-field/article-fields';
import { Category } from '../category/category';
import { Deposit } from '../deposit/deposit';
import { Location } from '../location/location';
import { Make } from '../make/make';
import { Taxes } from '../tax/taxes';
import { UnitOfMeasurement } from '../unit-of-measurement/unit-of-measurement.model';
import { User } from '../user/user';

import * as moment from 'moment';
import { Account } from '../account/account';
import { Application } from '../application/application.model';
import { Classification } from '../classification/classification';
import { Company } from '../company/company';
import { Currency } from '../currency/currency';
import { VariantType } from '../variant-type/variant-type';
import { VariantValue } from '../variant-value/variant-value';

export class Article {
  public _id: string;
  public tiendaNubeId: string;
  public type: Type = Type.Final;
  public containsVariants: boolean = false;
  public containsStructure: boolean = false;
  public order: number = 1;
  public code: string = '0000000001';
  public codeProvider: string = '0';
  public codeSAT: string;
  public description: string = '';
  public posDescription: string = '';
  public quantityPerMeasure: number = 1;
  public unitOfMeasurement: UnitOfMeasurement;
  public observation: string;
  public notes: string[];
  public tags: string[];
  public basePrice: number = 0.0;
  public taxes: Taxes[];
  public otherFields: ArticleFields[];
  public costPrice: number = 0.0;
  public costPrice2: number = 0.0;
  public markupPercentage: number = 0.0;
  public markupPrice: number = 0.0;
  public salePrice: number = 0.0;
  public purchasePrice: number = 0.0;
  public currency: Currency;
  public make: Make;
  public deposits: [
    {
      _id: string;
      deposit: Deposit;
      capacity: number;
    }
  ];
  public locations: [
    {
      _id: string;
      location: Location;
    }
  ];
  public children: [
    {
      _id: string;
      article: Article;
      quantity: number;
    }
  ];
  public pictures: [
    {
      _id: string;
      picture: string;
      meliId: string;
    }
  ];
  public url: string;
  public category: Category;
  public barcode: string;
  public printIn: ArticlePrintIn = ArticlePrintIn.Counter;
  public posKitchen: Boolean = false;
  public allowPurchase: Boolean = true;
  public allowSale: Boolean = true;
  public allowStock: Boolean = true;
  public allowSaleWithoutStock: Boolean = false;
  public allowMeasure: Boolean = false;
  public isWeigth: Boolean = false;
  public ecommerceEnabled: Boolean = false;
  public favourite: Boolean = false;
  public forShipping: Boolean = false;
  public picture: string = './../../../assets/img/default.jpg';
  public providers: Company[];
  public provider: Company;
  public classification: Classification;
  public applications: Application[];
  public salesAccount: Account;
  public purchaseAccount: Account;
  public wooId: string;
  public meliId: string;
  public meliAttrs: IMeliAttrs;
  public minStock: number;
  public maxStock: number;
  public pointOfOrder: number;
  public operationType: string;
  public creationUser: User;
  public creationDate: string = moment().format('YYYY-MM-DDTHH:mm:ssZ');
  public updateUser: User;
  public updateDate: string;
  public harticle: Article;
  public m3: number;
  public weight: number;
  public width: number;
  public height: number;
  public depth: number;
  public showMenu: Boolean = false;
  public updateVariants: Boolean = true;
  public salePriceTN: number;
  public variantType1: VariantType;
  public variantValue1: VariantValue;
  public variantType2: VariantType;
  public variantValue2: VariantValue;
  public variants: [
    {
      value: VariantValue;
      type: VariantType;
    }
  ];

  constructor() {}
}

export enum ArticlePrintIn {
  Bar = <any>'Bar',
  Kitchen = <any>'Cocina',
  Counter = <any>'Mostrador',
  Voucher = <any>'Voucher',
}

export enum Type {
  Final = <any>'Final',
  Variant = <any>'Variante',
  Ingredient = <any>'Ingrediente',
}

export let attributes = [
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
    name: 'showMenu',
    visible: false,
    disabled: false,
    filter: true,
    datatype: 'boolean',
    project: null,
    align: 'left',
    required: true,
  },
  {
    name: 'salePriceTN',
    visible: false,
    disabled: false,
    filter: true,
    datatype: 'number',
    project: null,
    align: 'left',
    required: true,
  },
  {
    name: 'order',
    visible: false,
    disabled: false,
    filter: true,
    datatype: 'number',
    project: null,
    align: 'left',
    required: false,
  },
  {
    name: 'code',
    visible: true,
    disabled: false,
    filter: true,
    datatype: 'string',
    project: null,
    align: 'left',
    required: false,
  },
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
    name: 'posDescription',
    visible: true,
    disabled: false,
    filter: true,
    datatype: 'string',
    project: null,
    align: 'left',
    required: false,
  },
  {
    name: 'make.description',
    visible: true,
    disabled: false,
    filter: true,
    datatype: 'string',
    project: null,
    align: 'left',
    required: false,
  },
  {
    name: 'category.description',
    visible: true,
    disabled: false,
    filter: true,
    datatype: 'string',
    project: null,
    align: 'left',
    required: false,
  },
  {
    name: 'category.parent.description',
    visible: false,
    disabled: false,
    filter: true,
    datatype: 'string',
    project: null,
    align: 'left',
    required: false,
  },
  {
    name: 'costPrice2',
    visible: false,
    disabled: false,
    filter: true,
    datatype: 'currency',
    project: null,
    align: 'right',
    required: false,
  },
  {
    name: 'salePrice',
    visible: true,
    disabled: false,
    filter: true,
    datatype: 'currency',
    project: null,
    align: 'right',
    required: false,
  },
  {
    name: 'purchasePrice',
    visible: false,
    disabled: false,
    filter: true,
    datatype: 'currency',
    project: null,
    align: 'right',
    required: false,
  },
  {
    name: 'taxesPercentage',
    visible: false,
    disabled: false,
    filter: true,
    datatype: 'string',
    project: `{"$reduce":{"input":"$taxes.percentage","initialValue":"","in":{"$concat":["$$value",{"$cond":{"if":{"$eq":["$$value",""]},"then":"","else":"; "}},{"$concat":[{"$toString":"$$this"},"%"]}]}}}`,
    align: 'left',
    required: false,
  },
  {
    name: 'currency.name',
    visible: false,
    disabled: false,
    filter: true,
    datatype: 'string',
    project: null,
    align: 'left',
    required: false,
  },
  {
    name: 'observation',
    visible: true,
    disabled: false,
    filter: true,
    datatype: 'string',
    project: null,
    align: 'left',
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
    name: 'costPrice',
    visible: false,
    disabled: false,
    filter: true,
    datatype: 'currency',
    project: null,
    align: 'right',
    required: false,
  },
  {
    name: 'basePrice',
    visible: false,
    disabled: false,
    filter: true,
    datatype: 'currency',
    project: null,
    align: 'right',
    required: false,
  },
  {
    name: 'markupPercentage',
    visible: false,
    disabled: false,
    filter: true,
    datatype: 'percent',
    project: null,
    align: 'right',
    required: false,
  },
  {
    name: 'markupPrice',
    visible: false,
    disabled: false,
    filter: true,
    datatype: 'currency',
    project: null,
    align: 'right',
    required: false,
  },
  {
    name: 'otherFieldsValue',
    visible: false,
    disabled: false,
    filter: true,
    datatype: 'string',
    project: `{"$reduce":{"input":"$otherFields.value","initialValue":"","in":{"$concat":["$$value",{"$cond":{"if":{"$eq":["$$value",""]},"then":"","else":"; "}},{"$concat":[{"$toString":"$$this"},""]}]}}}`,
    align: 'left',
    required: false,
  },
  {
    name: 'printIn',
    visible: false,
    disabled: false,
    filter: true,
    datatype: 'string',
    project: null,
    align: 'left',
    required: false,
  },
  {
    name: 'allowPurchase',
    visible: false,
    disabled: false,
    filter: true,
    datatype: 'boolean',
    project: null,
    align: 'left',
    required: false,
  },
  {
    name: 'codeProvider',
    visible: false,
    disabled: false,
    filter: true,
    datatype: 'string',
    project: null,
    align: 'left',
    required: false,
  },
  {
    name: 'allowSale',
    visible: false,
    disabled: false,
    filter: true,
    datatype: 'boolean',
    project: null,
    align: 'left',
    required: false,
  },
  {
    name: 'allowPurchase',
    visible: false,
    disabled: false,
    filter: true,
    datatype: 'boolean',
    project: null,
    align: 'left',
    required: false,
  },
  {
    name: 'allowSaleWithoutStock',
    visible: false,
    disabled: false,
    filter: true,
    datatype: 'boolean',
    project: null,
    align: 'left',
    required: false,
  },
  {
    name: 'allowMeasure',
    visible: false,
    disabled: false,
    filter: true,
    datatype: 'boolean',
    project: null,
    align: 'left',
    required: false,
  },
  {
    name: 'isWeigth',
    visible: false,
    disabled: false,
    filter: true,
    datatype: 'boolean',
    project: null,
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
    name: 'ecommerceEnabled',
    visible: false,
    disabled: false,
    filter: true,
    datatype: 'boolean',
    project: null,
    align: 'left',
    required: false,
  },
  {
    name: 'applicationsName',
    visible: false,
    disabled: false,
    filter: true,
    datatype: 'string',
    project: `{"$reduce":{"input":"$applications.name","initialValue":"","in":{"$concat":["$$value",{"$cond":{"if":{"$eq":["$$value",""]},"then":"","else":"; "}},{"$concat":[{"$toString":"$$this"},""]}]}}}`,
    align: 'left',
    required: false,
  },
  {
    name: 'providersName',
    visible: false,
    disabled: false,
    filter: true,
    datatype: 'string',
    project: `{"$reduce":{"input":"$providers.name","initialValue":"","in":{"$concat":["$$value",{"$cond":{"if":{"$eq":["$$value",""]},"then":"","else":"; "}},{"$concat":[{"$toString":"$$this"},""]}]}}}`,
    align: 'left',
    required: false,
  },
  {
    name: 'providerName',
    visible: false,
    disabled: false,
    filter: true,
    datatype: 'string',
    project: `{"$reduce":{"input":"$provider.name","initialValue":"","in":{"$concat":["$$value",{"$cond":{"if":{"$eq":["$$value",""]},"then":"","else":"; "}},{"$concat":[{"$toString":"$$this"},""]}]}}}`,
    align: 'left',
    required: false,
  },
  {
    name: 'url',
    visible: false,
    disabled: false,
    filter: true,
    datatype: 'string',
    project: null,
    align: 'left',
    required: false,
  },
  {
    name: 'picture',
    visible: false,
    disabled: false,
    filter: true,
    datatype: 'string',
    project: null,
    align: 'left',
    required: false,
  },
  {
    name: 'favourite',
    visible: false,
    disabled: false,
    filter: true,
    datatype: 'boolean',
    project: null,
    align: 'left',
    required: false,
  },
  {
    name: 'posKitchen',
    visible: false,
    disabled: false,
    filter: true,
    datatype: 'boolean',
    project: null,
    align: 'left',
    required: false,
  },
  {
    name: 'tags',
    visible: false,
    disabled: false,
    filter: true,
    datatype: 'string',
    project: `{"$reduce":{"input":"$tags","initialValue":"","in":{"$concat":["$$value",{"$cond":{"if":{"$eq":["$$value",""]},"then":"","else":"; "}},{"$concat":[{"$toString":"$$this"}]}]}}}`,
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
    required: true,
  },
  {
    name: 'meliId',
    visible: false,
    disabled: false,
    filter: true,
    datatype: 'string',
    project: null,
    align: 'left',
    required: true,
  },
  {
    name: 'tiendaNubeId',
    visible: false,
    disabled: false,
    filter: true,
    datatype: 'string',
    project: null,
    align: 'left',
    required: true,
  },
  {
    name: 'type',
    visible: false,
    disabled: false,
    filter: false,
    datatype: 'string',
    defaultFilter: `{ "$eq": "Final" }`,
    project: null,
    align: 'left',
    required: true,
  },
  {
    name: 'containsVariants',
    visible: false,
    disabled: false,
    filter: true,
    datatype: 'boolean',
    project: null,
    align: 'left',
    required: true,
  },
  {
    name: 'containsStructure',
    visible: false,
    disabled: false,
    filter: true,
    datatype: 'boolean',
    project: null,
    align: 'left',
    required: true,
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
  {
    name: 'weight',
    visible: false,
    disabled: false,
    filter: true,
    datatype: 'string',
    project: null,
    align: 'left',
    required: false,
  },
  {
    name: 'depth',
    visible: false,
    disabled: false,
    filter: true,
    datatype: 'string',
    project: null,
    align: 'left',
    required: false,
  },
  {
    name: 'width',
    visible: false,
    disabled: false,
    filter: true,
    datatype: 'string',
    project: null,
    align: 'left',
    required: false,
  },
  {
    name: 'height',
    visible: false,
    disabled: false,
    filter: true,
    datatype: 'string',
    project: null,
    align: 'left',
    required: false,
  },
  {
    name: 'm3',
    visible: false,
    disabled: false,
    filter: true,
    datatype: 'number',
    project: null,
    align: 'left',
    required: false,
  },
  {
    name: '_id',
    visible: false,
    disabled: false,
    filter: true,
    datatype: 'string',
    project: null,
    align: 'left',
    required: false,
  },
];

export let attributesVariant = [
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
    name: 'showMenu',
    visible: false,
    disabled: false,
    filter: true,
    datatype: 'boolean',
    project: null,
    align: 'left',
    required: true,
  },
  {
    name: 'order',
    visible: false,
    disabled: false,
    filter: true,
    datatype: 'number',
    project: null,
    align: 'left',
    required: false,
  },
  {
    name: 'code',
    visible: true,
    disabled: false,
    filter: true,
    datatype: 'string',
    project: null,
    align: 'left',
    required: false,
  },
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
    name: 'posDescription',
    visible: true,
    disabled: false,
    filter: true,
    datatype: 'string',
    project: null,
    align: 'left',
    required: false,
  },
  {
    name: 'make.description',
    visible: true,
    disabled: false,
    filter: true,
    datatype: 'string',
    project: null,
    align: 'left',
    required: false,
  },
  {
    name: 'category.description',
    visible: true,
    disabled: false,
    filter: true,
    datatype: 'string',
    project: null,
    align: 'left',
    required: false,
  },
  {
    name: 'category.parent.description',
    visible: false,
    disabled: false,
    filter: true,
    datatype: 'string',
    project: null,
    align: 'left',
    required: false,
  },
  {
    name: 'costPrice2',
    visible: false,
    disabled: false,
    filter: true,
    datatype: 'currency',
    project: null,
    align: 'right',
    required: false,
  },
  {
    name: 'salePriceTN',
    visible: false,
    disabled: false,
    filter: true,
    datatype: 'number',
    project: null,
    align: 'left',
    required: true,
  },
  {
    name: 'salePrice',
    visible: true,
    disabled: false,
    filter: true,
    datatype: 'currency',
    project: null,
    align: 'right',
    required: false,
  },
  {
    name: 'purchasePrice',
    visible: false,
    disabled: false,
    filter: true,
    datatype: 'currency',
    project: null,
    align: 'right',
    required: false,
  },
  {
    name: 'taxesPercentage',
    visible: false,
    disabled: false,
    filter: true,
    datatype: 'string',
    project: `{"$reduce":{"input":"$taxes.percentage","initialValue":"","in":{"$concat":["$$value",{"$cond":{"if":{"$eq":["$$value",""]},"then":"","else":"; "}},{"$concat":[{"$toString":"$$this"},"%"]}]}}}`,
    align: 'left',
    required: false,
  },
  {
    name: 'currency.name',
    visible: false,
    disabled: false,
    filter: true,
    datatype: 'string',
    project: null,
    align: 'left',
    required: false,
  },
  {
    name: 'observation',
    visible: true,
    disabled: false,
    filter: true,
    datatype: 'string',
    project: null,
    align: 'left',
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
    name: 'costPrice',
    visible: false,
    disabled: false,
    filter: true,
    datatype: 'currency',
    project: null,
    align: 'right',
    required: false,
  },
  {
    name: 'basePrice',
    visible: false,
    disabled: false,
    filter: true,
    datatype: 'currency',
    project: null,
    align: 'right',
    required: false,
  },
  {
    name: 'markupPercentage',
    visible: false,
    disabled: false,
    filter: true,
    datatype: 'percent',
    project: null,
    align: 'right',
    required: false,
  },
  {
    name: 'markupPrice',
    visible: false,
    disabled: false,
    filter: true,
    datatype: 'currency',
    project: null,
    align: 'right',
    required: false,
  },
  {
    name: 'otherFieldsValue',
    visible: false,
    disabled: false,
    filter: true,
    datatype: 'string',
    project: `{"$reduce":{"input":"$otherFields.value","initialValue":"","in":{"$concat":["$$value",{"$cond":{"if":{"$eq":["$$value",""]},"then":"","else":"; "}},{"$concat":[{"$toString":"$$this"},""]}]}}}`,
    align: 'left',
    required: false,
  },
  {
    name: 'printIn',
    visible: false,
    disabled: false,
    filter: true,
    datatype: 'string',
    project: null,
    align: 'left',
    required: false,
  },
  {
    name: 'allowPurchase',
    visible: false,
    disabled: false,
    filter: true,
    datatype: 'boolean',
    project: null,
    align: 'left',
    required: false,
  },
  {
    name: 'codeProvider',
    visible: false,
    disabled: false,
    filter: true,
    datatype: 'string',
    project: null,
    align: 'left',
    required: false,
  },
  {
    name: 'allowSale',
    visible: false,
    disabled: false,
    filter: true,
    datatype: 'boolean',
    project: null,
    align: 'left',
    required: false,
  },
  {
    name: 'allowPurchase',
    visible: false,
    disabled: false,
    filter: true,
    datatype: 'boolean',
    project: null,
    align: 'left',
    required: false,
  },
  {
    name: 'allowSaleWithoutStock',
    visible: false,
    disabled: false,
    filter: true,
    datatype: 'boolean',
    project: null,
    align: 'left',
    required: false,
  },
  {
    name: 'allowMeasure',
    visible: false,
    disabled: false,
    filter: true,
    datatype: 'boolean',
    project: null,
    align: 'left',
    required: false,
  },
  {
    name: 'isWeigth',
    visible: false,
    disabled: false,
    filter: true,
    datatype: 'boolean',
    project: null,
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
    name: 'ecommerceEnabled',
    visible: false,
    disabled: false,
    filter: true,
    datatype: 'boolean',
    project: null,
    align: 'left',
    required: false,
  },
  {
    name: 'applicationsName',
    visible: false,
    disabled: false,
    filter: true,
    datatype: 'string',
    project: `{"$reduce":{"input":"$applications.name","initialValue":"","in":{"$concat":["$$value",{"$cond":{"if":{"$eq":["$$value",""]},"then":"","else":"; "}},{"$concat":[{"$toString":"$$this"},""]}]}}}`,
    align: 'left',
    required: false,
  },
  {
    name: 'providersName',
    visible: false,
    disabled: false,
    filter: true,
    datatype: 'string',
    project: `{"$reduce":{"input":"$providers.name","initialValue":"","in":{"$concat":["$$value",{"$cond":{"if":{"$eq":["$$value",""]},"then":"","else":"; "}},{"$concat":[{"$toString":"$$this"},""]}]}}}`,
    align: 'left',
    required: false,
  },
  {
    name: 'providerName',
    visible: false,
    disabled: false,
    filter: true,
    datatype: 'string',
    project: `{"$reduce":{"input":"$provider.name","initialValue":"","in":{"$concat":["$$value",{"$cond":{"if":{"$eq":["$$value",""]},"then":"","else":"; "}},{"$concat":[{"$toString":"$$this"},""]}]}}}`,
    align: 'left',
    required: false,
  },
  {
    name: 'url',
    visible: false,
    disabled: false,
    filter: true,
    datatype: 'string',
    project: null,
    align: 'left',
    required: false,
  },
  {
    name: 'picture',
    visible: false,
    disabled: false,
    filter: true,
    datatype: 'string',
    project: null,
    align: 'left',
    required: false,
  },
  {
    name: 'favourite',
    visible: false,
    disabled: false,
    filter: true,
    datatype: 'boolean',
    project: null,
    align: 'left',
    required: false,
  },
  {
    name: 'posKitchen',
    visible: false,
    disabled: false,
    filter: true,
    datatype: 'boolean',
    project: null,
    align: 'left',
    required: false,
  },
  {
    name: 'tags',
    visible: false,
    disabled: false,
    filter: true,
    datatype: 'string',
    project: `{"$reduce":{"input":"$tags","initialValue":"","in":{"$concat":["$$value",{"$cond":{"if":{"$eq":["$$value",""]},"then":"","else":"; "}},{"$concat":[{"$toString":"$$this"}]}]}}}`,
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
    required: true,
  },
  {
    name: 'meliId',
    visible: false,
    disabled: false,
    filter: true,
    datatype: 'string',
    project: null,
    align: 'left',
    required: true,
  },
  {
    name: 'tiendaNubeId',
    visible: false,
    disabled: false,
    filter: true,
    datatype: 'string',
    project: null,
    align: 'left',
    required: true,
  },
  {
    name: 'variantType1.name',
    visible: false,
    disabled: false,
    filter: true,
    datatype: 'string',
    project: null,
    align: 'left',
    required: true,
  },
  {
    name: 'variantValue1.description',
    visible: false,
    disabled: false,
    filter: true,
    datatype: 'string',
    project: null,
    align: 'left',
    required: true,
  },
  {
    name: 'variantType2.name',
    visible: false,
    disabled: false,
    filter: true,
    datatype: 'string',
    project: null,
    align: 'left',
    required: true,
  },
  {
    name: 'variantValue2.description',
    visible: false,
    disabled: false,
    filter: true,
    datatype: 'string',
    project: null,
    align: 'left',
    required: true,
  },
  {
    name: 'type',
    visible: false,
    disabled: false,
    filter: false,
    datatype: 'string',
    defaultFilter: `{ "$eq": "Variante" }`,
    project: null,
    align: 'left',
    required: true,
  },
  {
    name: 'containsVariants',
    visible: false,
    disabled: false,
    filter: true,
    datatype: 'boolean',
    project: null,
    align: 'left',
    required: true,
  },
  {
    name: 'containsStructure',
    visible: false,
    disabled: false,
    filter: true,
    datatype: 'boolean',
    project: null,
    align: 'left',
    required: true,
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
  {
    name: 'weight',
    visible: false,
    disabled: false,
    filter: true,
    datatype: 'string',
    project: null,
    align: 'left',
    required: false,
  },
  {
    name: 'depth',
    visible: false,
    disabled: false,
    filter: true,
    datatype: 'string',
    project: null,
    align: 'left',
    required: false,
  },
  {
    name: 'width',
    visible: false,
    disabled: false,
    filter: true,
    datatype: 'string',
    project: null,
    align: 'left',
    required: false,
  },
  {
    name: 'height',
    visible: false,
    disabled: false,
    filter: true,
    datatype: 'string',
    project: null,
    align: 'left',
    required: false,
  },
  {
    name: 'm3',
    visible: false,
    disabled: false,
    filter: true,
    datatype: 'number',
    project: null,
    align: 'left',
    required: false,
  },
  {
    name: '_id',
    visible: false,
    disabled: false,
    filter: true,
    datatype: 'string',
    project: null,
    align: 'left',
    required: false,
  },
];

export interface IMeliAttrs {
  category: any;
  description: {
    plain_text: string;
  };
  listing_type_id: string;
  sale_terms: {
    id: string;
    value_name: string;
  }[];
  attributes: {
    id: string;
    value_name: string;
  }[];
}
