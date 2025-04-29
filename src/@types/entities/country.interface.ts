import { Activity } from '@types';

export interface Country extends Activity {
  _id: string;
  code: string;
  name: string;
  callingCodes: string;
  timezones: string;
  flag: string;
  alpha2Code: string;
  alpha3Code: string;
}
