import { TransactionType } from './transaction-type.interface';
import { TransactionState } from './transaction.interface';

export interface CancelationType {
  origin: TransactionType;
  destination: TransactionType;
  automaticSelection: boolean;
  modifyBalance: boolean;
  requestAutomatic: boolean;
  requestCompany: boolean;
  requestStatusOrigin: TransactionState;
  stateOrigin: TransactionState;
  updatePrices: boolean;
}
