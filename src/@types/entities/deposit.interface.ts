import { Activity, Branch } from '@types';

export interface Deposit extends Activity {
  _id: string;
  name: string;
  branch: Branch;
  capacity: number;
  default: Boolean;
}
