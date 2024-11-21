import { User } from '@types';

export interface IAudit {
  date: string;
  user: User;
}

export interface IModel {
  _id: string;
  audits: IAudit[];
  creationDate: string;
  updateDate: string;
  creationUser: User;
  updateUser: User;
  operationType: string;
}
