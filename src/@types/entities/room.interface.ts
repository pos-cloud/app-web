import { Activity } from '@types';

export interface Room extends Activity {
  _id: string;
  description: string;
}
