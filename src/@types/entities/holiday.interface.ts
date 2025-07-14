import { Activity } from '@types';

export interface Holiday extends Activity {
  name: string;
  date: Date;
}
