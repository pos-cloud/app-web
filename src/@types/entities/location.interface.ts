import { Activity, Deposit } from '@types';

export interface Location extends Activity {
  _id: string;
  description: string;
  positionX: string;
  positionY: string;
  positionZ: string;
  deposit: Deposit;
}
