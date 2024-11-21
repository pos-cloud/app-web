import { Activity } from '@types';

export interface Make extends Activity {
  _id: string;
  description: string;
  visibleSale: boolean;
}
