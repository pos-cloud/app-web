import { Activity, Resource } from '@types';

export interface Gallery extends Activity {
  _id: string;
  name: string;
  interval: number;
  barcode: boolean;
  resources: [
    {
      resource: Resource;
      order: number;
    },
  ];
}
