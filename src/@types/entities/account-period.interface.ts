import { Activity } from '@types';

export interface AccountPeriod extends Activity {
  _id: string;
  description: string;
  status: StatusPeriod;
  startDate: string;
  endDate: string;
}

export enum StatusPeriod {
  Open = <any>'Abierto',
  Close = <any>'Cerrado',
}
