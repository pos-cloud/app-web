import { Activity } from '@types';

export interface RelationType extends Activity {
  _id: string;
  code: string; // default: '1'
  description: string; // default: ''
}
