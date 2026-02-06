import { Activity, Article } from '@types';

export interface BusinessRule extends Activity {
  _id: string;
  code: string;
  name: string;
  active: boolean;
  startDate: Date;
  endDate: Date;
  totalStock: number;
  currentStock: number;
  discountType: DiscountType;
  discountValue: number;
  articleDiscount: Article;
  articles: BusinessRuleArticle[];
  articleGroups?: BusinessRuleArticleGroup[];
  days: Day[];
  includeInApplyAll?: boolean;
}

export interface BusinessRuleArticleGroup {
  articles: string[] | Article[];
  quantity: number;
}

export enum DiscountType {
  Percentage = 'percentage',
  Amount = 'amount',
}

export enum Day {
  Monday = 'Monday',
  Tuesday = 'Tuesday',
  Wednesday = 'Wednesday',
  Thursday = 'Thursday',
  Friday = 'Friday',
  Saturday = 'Saturday',
  Sunday = 'Sunday',
}

export interface BusinessRuleArticle {
  article: Article;
  quantity: number;
}
