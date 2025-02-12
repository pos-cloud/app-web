import { Activity } from '@types';

export interface CurrencyValue extends Activity {
  _id: string;
  name: string;
  value: number;
}
