import { Activity } from '@types';

export interface Resource extends Activity {
  _id: string;
  name: string;
  type: string;
  file: string;
}
