import { Activity, CancellationType, Transaction } from '@types';

export interface MovementOfCancellation extends Activity {
  _id: string;
  transactionOrigin: Transaction;
  transactionDestination: Transaction;
  type: CancellationType;
  balance: number;
}
