import { Activity } from '../common/activity.interface';
export interface Voucher extends Activity {
  _id: string;
  date: string;
  token: string;
  readings: number;
  expirationDate: string;
}
