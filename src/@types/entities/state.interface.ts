import { Activity, Country } from '@types';

export interface State extends Activity {
  _id: string;
  code: string;
  name: string;
  country: Country;
}
