import { VariantType, VariantValue } from '@types';
import { Article } from '../article/article';

export class Variant {
  public _id: string;
  public type: VariantType;
  public value: VariantValue;
  public articleParent: Article;
  public articleChild: Article;

  constructor() {}
}
