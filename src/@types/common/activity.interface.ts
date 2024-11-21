import { User } from '@types';
export interface Activity {
  _id: string;
  audits: [
    {
      date: string;
      user: User;
    },
  ];
  creationDate: string;
  updateDate: string;
  creationUser: User;
  updateUser: User;
  operationType: string;
}
