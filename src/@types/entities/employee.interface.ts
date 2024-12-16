import { Activity, EmployeeType } from '@types';

export interface Employee extends Activity {
  _id: string;
  name: string;
  phone: string;
  address: string;
  type: EmployeeType;
}
