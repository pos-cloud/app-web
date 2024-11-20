import { User } from "./user.interface";

export interface Category {
     _id: string;
     order: number;
     description: string;
     picture: string;
     visibleInvoice: boolean;
     visibleOnSale: boolean;
     visibleOnPurchase: boolean;
     ecommerceEnabled: boolean;
     applications: any; //Application[];
     favourite: boolean;
     isRequiredOptional: boolean;
     wooId: string;
     parent: Category;
     observation: string;
     tiendaNubeId: string;
     showMenu: boolean;
     creationUser: User;
     creationDate: string;
     updateUser: User;
     updateDate: string;

}