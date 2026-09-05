import { Activity, Article, Branch, Deposit } from '@types';

export interface ArticleStock extends Activity {
  _id: string;
  article: Article;
  branch: Branch;
  deposit: Deposit;
  realStock: number;
  minStock: number;
  maxStock: number;
}
