import { Activity, Article } from '@types';

export interface Structure extends Activity {
  _id: string;
  parent: Article;
  child: Article;
  quantity: number;
  utilization: Utilization;
  optional: boolean;
  increasePrice: number;
}

export enum Utilization {
  Production = <any>'Produccion',
  Sale = <any>'Venta',
}
