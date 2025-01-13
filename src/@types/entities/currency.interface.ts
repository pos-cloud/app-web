import { Activity } from '../common/activity.interface';

export interface Currency extends Activity {
  _id: string;
  code: number;
  agency: number;
  name: string;
  sign: number;
  quotation: number | null;
}
