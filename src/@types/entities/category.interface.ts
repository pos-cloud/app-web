import { Activity } from '@types';

export interface Category extends Activity {
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
}
