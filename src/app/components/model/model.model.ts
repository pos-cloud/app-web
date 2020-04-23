import { User } from '../user/user';

export class Model {

  public _id: string;
  public creationDate: string;
  public updateDate: string;
  public creationUser: User;
  public updateUser: User;
  public operationType: string;

  constructor() { }
}
