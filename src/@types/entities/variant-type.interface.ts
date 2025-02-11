import { Activity } from '@types';

export interface VariantType extends Activity {
  _id: string;
  order: number;
  name: string;
  meliId: string;
}
