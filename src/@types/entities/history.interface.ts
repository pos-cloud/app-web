import { Activity } from '@types';

export interface History extends Activity {
  collectionName?: string;
  doc?: any;
  name?: string;
  origin?: number;
  letter?: string;
  number?: number;
}
