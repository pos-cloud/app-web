import { Activity, Country, IdentificationType, State, VATCondition } from '@types';

export interface Transport extends Activity {
  _id: string;
  name: string;
  fantasyName: string;
  vatCondition: VATCondition;
  identificationType: IdentificationType;
  identificationValue: string;
  grossIncome: string;
  address: string;
  city: string;
  phones: string;
  emails: string;
  observation: string;
  country: Country;
  flat: string;
  state: State;
  addressNumber: string;
  zipCode: string;
}
