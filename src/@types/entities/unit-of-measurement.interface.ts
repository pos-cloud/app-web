import { Activity } from '@types';

export interface UnitOfMeasurement extends Activity {
  _id: string;
  code: string;
  abbreviation: string;
  name: string;
}
