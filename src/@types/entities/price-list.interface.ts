import { Activity, Article, Category, Make } from '@types';

export interface PriceList extends Activity {
  _id: string;
  name: string;
  percentage: number;
  percentageType: 'final' | 'margin'; // Nuevo campo
  allowSpecialRules: boolean;
  default: boolean;
  rules: {
    _id: string;
    category: Category | string;
    make: Make | string;
    percentage: number;
  }[];
  exceptions: {
    _id: string;
    article: Article | string;
    percentage: number;
  }[];
}
