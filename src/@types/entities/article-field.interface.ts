import { Activity } from '@types';

export interface ArticleField extends Activity {
  _id: string;
  order: number;
  name: string;
  datatype: ArticleFieldType;
  value: string;
  modify: boolean;
  modifyVAT: boolean;
  discriminateVAT: boolean;
  ecommerceEnabled: boolean;
}

export interface ArticleFields {
  articleField: ArticleField;
  value: string;
  amount: number;
}

export enum ArticleFieldType {
  Percentage = 'Porcentaje',
  Number = 'Número',
  String = 'Alfabético',
  Array = 'Lista',
}
