import { Activity, Article, Category, Make } from '@types';

export interface PriceList extends Activity {
  _id: string;
  name: string;
  percentage: number;
  allowSpecialRules: boolean;
  default: boolean;
  rules: {
    _id: string;
    category: Category;
    make: Make;
    percentage: number;
  }[];
  exceptions: {
    _id: string;
    article: Article;
    percentage: number;
  }[];
}
