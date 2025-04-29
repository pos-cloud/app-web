import { Activity } from '@types';

export interface Category extends Activity {
  _id: string;
  order: number;
  description: string;
  picture: string;
  parent: Category;
  favourite: boolean;
  isRequiredOptional: boolean;
  observation: string;
  publishWooCommerce: boolean;
  publishTiendaNube: boolean;
  showMenu: boolean;
  wooId: string;
  tiendaNubeId: number;
  visibleInvoice: boolean;
  visibleOnSale: boolean;
  visibleOnPurchase: boolean;
}
