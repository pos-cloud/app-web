import { EmployeeType } from '@types';

export class Employee {
  public _id: string = '';
  public code: number;
  public name: string;
  public type: EmployeeType;

  constructor() {}
}
