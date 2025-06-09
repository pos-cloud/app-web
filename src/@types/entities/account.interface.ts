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
  Asset = 'Activo',
  Passive = 'Pasivo',
  netWorth = 'Patrimonio Neto',
  Result = 'Resultado',
  Compensatory = 'Compensatoria',
  Other = 'Otro',
}

export enum Modes {
  Synthetic = 'Sintetico',
  Analytical = 'Analitico',
}
