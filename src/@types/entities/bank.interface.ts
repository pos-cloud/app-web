import { Activity } from '../common/activity.interface';

export interface Bank extends Activity {
  _id: string;
  code: number;
  agency: number;
  account: any;
  name: string;
}
