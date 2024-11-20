import { User } from "./user.interface";

export interface Classification {
    _id: string;
    name : string;
    creationUser?: User;
    creationDate?: string;
    updateUser?: User;
    updateDate?: string;
}