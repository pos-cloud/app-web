import { User } from './user.interface';

export interface Make {
  _id: string;
  description: string;
  visibleSale: boolean;
  creationUser?: User;
  creationDate?: string;
  updateUser?: User;
  updateDate?: string;
}
