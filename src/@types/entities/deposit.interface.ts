import { Branch } from "./branch.interface";
import { User } from "./user.interface";

export interface Deposit {
     _id: string;
     name: string;
     branch: Branch;
     capacity: number;
     default : Boolean;
     operationType : string;
     creationDate: string;
	 updateUser: User;
     updateDate: string;
}