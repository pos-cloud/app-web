import { Activity, Employee, Room, Transaction } from '@types';

export interface Table extends Activity {
  _id: string;
  description: string;
  room: Room;
  chair: number;
  diners: number;
  state: TableState;
  employee: Employee;
  lastTransaction: Transaction | any;
}

export enum TableState {
  Available = <any>'Disponible',
  Busy = <any>'Ocupada',
  Reserved = <any>'Reservada',
  Pending = <any>'Pendiente',
  Disabled = <any>'No Habilitada',
}
