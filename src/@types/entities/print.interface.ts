import { Printer } from '@types';

export interface Print {
  _id?: string;
  fileName?: string;
  content?: string;
  printer?: Printer;
}
