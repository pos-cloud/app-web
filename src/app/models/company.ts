import { VATCondition } from './vat-condition';

import * as moment from 'moment';
import 'moment/locale/es';

export class Company {
    
    public _id: string;
    public code: number = 1;
    public name: string;
    public fantasyName: string;
    public entryDate: string  = moment().format('YYYY-MM-DDTHH:mm:ssZ');
    public type: CompanyType = CompanyType.Client;
    public vatCondition: VATCondition;
    public CUIT: string;
    public DNI: string;
    public address: string;
    public city: string;
    public phones: string;
    public emails: string;
    public gender: GenderType;
    public birthday: string;
    public observation: string;

    constructor() {}
}

export enum CompanyType {
    Client = <any> "Cliente",
    Provider = <any> "Proveedor",
}

export enum GenderType {
    Male = <any> "Hombre",
    Female = <any> "Mujer"
}