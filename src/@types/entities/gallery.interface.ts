import { Resource } from "./resource.iterface";
import { User } from "./user.interface";

export interface Gallery {
     _id: string;
     name: string;
     colddown: number;
     barcode: boolean;
     resources: [
      {
        resource: Resource;
        order: number;
      }
    ];
     creationDate: string;
     updateUser: User;
     updateDate: string;
  }