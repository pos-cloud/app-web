import { Activity } from '@types';

export interface Branch extends Activity {
  _id: string;
  number: number;
  name: string;
  default: boolean;
  image: string;
}
