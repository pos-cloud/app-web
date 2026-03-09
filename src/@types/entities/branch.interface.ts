import { Activity, IdentificationType, VATCondition } from '@types';

export interface Branch extends Activity {
  _id: string;
  number: number;
  name: string;
  default: boolean;
  branchName: string;
  branchFantasyName: string;
  branchIdentificationType: IdentificationType;
  branchIdentificationValue: string;
  branchVatCondition: VATCondition;
  branchStartOfActivity: string;
  branchGrossIncome: string;
  branchAddress: string;
  branchPicture: string;
  branchPhone: string;
  branchPostalCode: string;
  branchCity: string;
  branchState: string;
  country: string;
  latitude: string;
  longitude: string;
  timezone: string;
}
