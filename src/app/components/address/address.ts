import { Company } from '../company/company';

export class Address {

  public _id: string;
  public type: string;
  public name: string;
  public number: string;
  public floor: string;
  public flat: string;
  public postalCode: string;
  public city: string;
  public state: string;
  public country: string = 'Argentina';
  public latitude: string;
  public longitude: string;
  public observation: string;
  public company: Company;
  public forBilling: boolean = true;
  public forShipping: boolean = true;

  constructor() { }
}
