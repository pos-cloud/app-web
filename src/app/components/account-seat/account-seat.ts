import { Account, AccountPeriod, IAttribute } from '@types';
import { Model } from '../model/model.model';
import { Transaction } from '../transaction/transaction';

export class AccountSeat extends Model {
  public _id: string;
  public transaction: Transaction;
  public period: AccountPeriod;
  public date: Date;
  public observation: string;
  public items: [
    {
      account: Account;
      debit: Number;
      credit: Number;
    }
  ];

  constructor() {
    super();
  }

  static getAttributes(): IAttribute[] {
    return Model.getAttributes([
      {
        name: 'date',
        visible: true,
        disabled: false,
        filter: true,
        datatype: 'string',
        project: `{ "$dateToString": { "date": "$date", "format": "%d/%m/%Y", "timezone": "-03:00" } }`,
        align: 'center',
        required: true,
      },
      {
        name: 'period.description',
        visible: true,
        disabled: false,
        filter: true,
        datatype: 'string',
        align: 'center',
        required: true,
      },
      {
        name: 'observation',
        visible: false,
        filter: true,
        datatype: 'string',
        align: 'left',
      },
      {
        name: 'transaction.type.name',
        visible: true,
        filter: true,
        datatype: 'string',
        align: 'left',
      },
      {
        name: 'transaction.type.transactionMovement',
        visible: true,
        filter: true,
        datatype: 'string',
        align: 'left',
      },
      {
        name: 'transaction.origin',
        visible: true,
        filter: true,
        datatype: 'number',
        align: 'left',
      },
      {
        name: 'transaction.letter',
        visible: true,
        filter: true,
        datatype: 'string',
        align: 'left',
      },
      {
        name: 'transaction.number',
        visible: true,
        filter: true,
        datatype: 'number',
        align: 'left',
      },
      {
        name: 'transaction.company.name',
        visible: true,
        filter: true,
        datatype: 'string',
        align: 'left',
      },
      {
        name: 'observation',
        visible: false,
        filter: true,
        datatype: 'string',
        align: 'left',
      },
      {
        name: 'transaction.totalPrice',
        visible: true,
        filter: true,
        datatype: 'currency',
        align: 'right',
      },
    ]);
  }
}
