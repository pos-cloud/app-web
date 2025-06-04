import { Activity } from '@types';

export interface Structure extends Activity {
  _id: string;
  parent: any;
  child: any;
  quantity: number;
  utilization: Utilization;
  optional: boolean;
  increasePrice: number;
}

export enum Utilization {
  Production = <any>'Produccion',
  Sale = <any>'Venta',
}
