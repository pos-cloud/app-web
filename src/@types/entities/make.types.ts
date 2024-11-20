import { User } from './user.types';

export interface Make {
  _id: string;
  description: string;
  visibleSale: boolean;
  creationUser?: User;
  creationDate?: string;
  updateUser?: User;
  updateDate?: string;
}
