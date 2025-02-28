import { Activity, VariantType } from '@types';

export interface VariantValue extends Activity {
  _id: string;
  type: VariantType;
  order: number;
  description: string;
  picture: string;
}
