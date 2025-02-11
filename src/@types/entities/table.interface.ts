import { Activity } from '@types';
import { Employee } from './employee.interface';
import { Room } from './room.interface';

export interface Table extends Activity {
  _id: string;
  description: string;
  room: Room;
  chair: number;
  diners: number;
  state: TableState;
  employee: Employee;
  lastTransaction: any; // Transaction;
}

export enum TableState {
  Available = <any>'Disponible',
  Busy = <any>'Ocupada',
  Reserved = <any>'Reservada',
  Pending = <any>'Pendiente',
  Disabled = <any>'No Habilitada',
}
