import { Activity } from '@types';

export interface EmailTemplate extends Activity {
  _id: string;
  name: string;
  design: string;
}
