import { Account, AccountPeriod, Activity, Transaction } from '@types';

export interface AccountSeat extends Activity {
  _id: string;
  transaction: Transaction;
  period: AccountPeriod;
  date: Date;
  observation: string;
  type: TypeAccountSeat,
  items: [
    {
      account: Account;
      debit: Number;
      credit: Number;
    }
  ];
}

export enum TypeAccountSeat {
  Automatic = 'automatic',
  Manual = 'manual',
  Reversal = 'reversal',
}
