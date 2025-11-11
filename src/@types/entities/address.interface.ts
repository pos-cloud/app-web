import { Activity, Company } from '@types';

export interface Address extends Activity {
  type: string;
  name: string;
  number: string;
  floor: string;
  flat: string;
  postalCode: string;
  city: string;
  state: string;
  country: string;
  latitude: string;
  longitude: string;
  observation: string;
  company: Company;
  forBilling: boolean;
  forShipping: boolean;
  shippingStatus: ShippingStatus;
  street: string;
  streetNumber: string;
  zipCode: string;
}

export enum ShippingStatus {
  Unpacked = 'Desempaquetado',
  Fulfilled = 'Enviado',
  Unfulfilled = 'No enviado',
}
