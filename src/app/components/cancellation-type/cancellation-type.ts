import { IAttribute } from 'app/util/attribute.interface';
import { Model } from '../model/model.model';
import { TransactionType } from '../transaction-type/transaction-type';
import { TransactionState } from '../transaction/transaction';

export class CancellationType extends Model {

  public origin: TransactionType;
  public destination: TransactionType;
  public automaticSelection: boolean = true;
  public modifyBalance: boolean = true;
  public requestAutomatic: boolean = false;
  public requestCompany: boolean = true;
  public requestStatusOrigin: TransactionState = TransactionState.Closed;
  public stateOrigin: TransactionState;

  constructor() { super(); }

  static getAttributes(): IAttribute[] {
    return Model.getAttributes([
      {
        name: 'origin.transactionMovement',
        visible: true,
        disabled: false,
        filter: true,
        defaultFilter: null,
        datatype: 'string',
        project: null,
        align: 'left',
        required: false,
      },
      {
        name: 'origin.name',
        visible: true,
        disabled: false,
        filter: true,
        defaultFilter: null,
        datatype: 'string',
        project: null,
        align: 'left',
        required: false,
      }, {
        name: 'destination.transactionMovement',
        visible: true,
        disabled: false,
        filter: true,
        defaultFilter: null,
        datatype: 'string',
        project: null,
        align: 'left',
        required: false,
      }, {
        name: 'destination.name',
        visible: true,
        disabled: false,
        filter: true,
        defaultFilter: null,
        datatype: 'string',
        project: null,
        align: 'left',
        required: false,
      }, {
        name: 'automaticSelection',
        visible: true,
        disabled: false,
        filter: true,
        defaultFilter: null,
        datatype: 'boolean',
        project: null,
        align: 'left',
        required: false,
      }, {
        name: 'modifyBalance',
        visible: true,
        disabled: false,
        filter: true,
        defaultFilter: null,
        datatype: 'boolean',
        project: null,
        align: 'left',
        required: false,
      }, {
        name: 'requestAutomatic',
        visible: true,
        disabled: false,
        filter: true,
        defaultFilter: null,
        datatype: 'boolean',
        project: null,
        align: 'left',
        required: false,
      }, {
        name: 'requestCompany',
        visible: true,
        disabled: false,
        filter: true,
        defaultFilter: null,
        datatype: 'boolean',
        project: null,
        align: 'left',
        required: false,
      }, {
        name: 'requestStatusOrigin',
        visible: true,
        disabled: false,
        filter: true,
        defaultFilter: null,
        datatype: 'string',
        project: null,
        align: 'left',
        required: false,
      }, {
        name: 'stateOrigin',
        visible: true,
        disabled: false,
        filter: true,
        defaultFilter: null,
        datatype: 'string',
        project: null,
        align: 'left',
        required: false,
      }
    ])
  }
}

