import { Activity, CompanyGroup, Country, Employee, IdentificationType, State, VATCondition } from '@types';

export interface Transport extends Activity {
  _id: string;
  code: number;
  name: string;
  fantasyName: string;
  entryDate: string;
  identificationType: IdentificationType;
  identificationValue: string;
  vatCondition: VATCondition;
  grossIncome: string;
  address: string;
  city: string;
  phones: string;
  emails: string;
  birthday: string;
  observation: string;
  allowCurrentAccount: boolean;
  group: CompanyGroup;
  employee: Employee;
  country: Country;
  floorNumber: string;
  flat: string;
  state: State;
  addressNumber: string;
  transport: Transport;
}
