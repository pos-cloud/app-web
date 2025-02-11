import { Activity, Article, VariantType, VariantValue } from '@types';

export interface Variant extends Activity {
  _id: string;
  type: VariantType;
  value: VariantValue;
  articleParent: Article;
  articleChild: Article;
}
