import { Account, AccountPeriod, Transaction } from '@types';

export interface AccountSeat {
  _id: string;
  transaction: Transaction;
  period: AccountPeriod;
  date: Date;
  observation: string;
  items: [
    {
      account: Account;
      debit: Number;
      credit: Number;
    }
  ];
}
