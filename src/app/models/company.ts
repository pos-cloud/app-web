export class Company {
    
    public _id: string;
    public code: number = 1;
    public name: string;
    public fantasyName: string;
    public type: any = CompanyType.Client;
    public IVACondition: string = "Responsable Inscripto";
    public CUIT: string;
    public address: string;
    public city: string;
    public phones: string;
    public mails: string;

    constructor() {}
}

export enum CompanyType {
    Client = <any> "Cliente",
    Provider = <any> "Proveedor",
}