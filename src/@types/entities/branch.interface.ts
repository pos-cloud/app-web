import { Activity, IdentificationType, VATCondition } from '@types';

export interface Branch extends Activity {
  _id: string;
  number: number;
  name: string;
  default: boolean;
  image: string;
  legalName: string;
  fantasyName: string;
  identificationType: IdentificationType;
  identificationValue: string;
  vatCondition: VATCondition;
  startOfActivity: string;
  grossIncome: string;
  address: string;
  phone: string;
  postalCode: string;
  country: string;
  latitude: string;
  longitude: string;
  timezone: string;
}
