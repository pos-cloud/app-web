import { VATCondition } from './vat-condition';

export class Company {
    
    public _id: string;
    public code: number = 1;
    public name: string;
    public fantasyName: string;
    public type: CompanyType = CompanyType.Client;
    public vatCondition: VATCondition;
    public CUIT: string;
    public DNI: string;
    public address: string;
    public city: string;
    public phones: string;
    public emails: String;

    constructor() {}
}

export enum CompanyType {
    Client = <any> "Cliente",
    Provider = <any> "Proveedor",
}