import { Activity, Branch } from '@types';

export interface Origin extends Activity {
  _id: string;
  number: number;
  branch: Branch;
}
