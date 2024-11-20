import { User } from "./user.interface";

export interface Branch {
     _id: string;
     number: number;
     name: string;
     default: boolean;
     image: string;
     creationUser: User;
     creationDate: string;
     updateUser: User;
     updateDate: string;
}