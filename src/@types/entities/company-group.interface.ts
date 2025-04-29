import { Activity } from '@types';

export interface CompanyGroup extends Activity {
  _id: string;
  description: string;
  discount: number;
}
