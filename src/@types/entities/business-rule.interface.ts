import { Activity, Article } from '@types';

export interface BusinessRule extends Activity {
  _id: string;
  code: string;
  name: string;
  description: string;
  termsAndConditions: string;
  startDate: Date;
  endDate: Date;
  minAmount: number;
  minQuantity: number;
  transactionAmountLimit: number;
  totalStock: number;
  currentStock: number;
  madeIn: string;
  active: boolean;
  discountType: DiscountType;
  discountValue: number;
  article: Article;
  item: Article;
  item2: Article;
  item3: Article;
  transactionTypeIds: string[];
  days: Day[];
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
