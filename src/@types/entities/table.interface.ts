import { Activity } from '../common/activity.interface';
import { Employee } from './employee.interface';
import { Room } from './room.interface';
import { TableState } from './table.enum';

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
