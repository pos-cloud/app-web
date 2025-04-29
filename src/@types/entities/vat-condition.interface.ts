import { Activity } from '@types';

export interface VATCondition extends Activity {
  _id: string;
  code: number;
  description: string;
  discriminate: boolean;
  transactionLetter: string;
  observation: string;
}
