import { Activity } from '@types';

export interface Account extends Activity {
  _id: string;
  code: string;
  description: string;
  parent: Account;
  type: Types;
  mode: Modes;
}

export enum Types {
  Asset = <any>'Activo',
  Passive = <any>'Pasivo',
  netWorth = <any>'Patrimonio Neto',
  Result = <any>'Resultado',
  Compensatory = <any>'Compensatoria',
  Other = <any>'Otro',
}

export enum Modes {
  Synthetic = <any>'Sintetico',
  Analytical = <any>'Analitico',
}
