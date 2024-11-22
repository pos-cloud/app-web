import { User } from "./user.interface";

export interface Resource {
     _id: string;
     name: string;
     type: string;
     file: string;
     creationUser: User;
     creationDate: string;
     updateUser: User;
     updateDate: string;
  }