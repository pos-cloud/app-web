import { Activity } from '../common/activity.interface';

export interface Currency extends Activity {
  _id: string;
  code: string;
  name: string;
  sign: string;
  quotation: number | null;
}
