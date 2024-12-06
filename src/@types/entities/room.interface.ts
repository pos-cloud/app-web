import { Activity } from '../common/activity.interface';

export interface Room extends Activity {
  _id: string;
  description: string;
}
