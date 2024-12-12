import { Activity } from '@types';
import { Branch } from './branch.interface';

export interface Deposit extends Activity {
  _id: string;
  name: string;
  branch: Branch;
  capacity: number;
  default: Boolean;
}
