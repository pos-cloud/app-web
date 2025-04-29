import { Activity } from '@types';

export interface IdentificationType extends Activity {
  _id: string;
  code: string;
  name: string;
}
