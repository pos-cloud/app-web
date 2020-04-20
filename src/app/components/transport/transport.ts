import { VATCondition } from '../vat-condition/vat-condition';
import { CompanyGroup } from '../company-group/company-group';
import { User } from '../user/user';
import { IdentificationType } from '../identification-type/identification-type';
import { Country } from '../country/country';
import { State } from '../state/state';

import * as moment from 'moment';
import { Employee } from 'app/components/employee/employee';

export class Transport {

    public _id: string;
    public code: number = 1;
    public name: string;
    public fantasyName: string;
    public entryDate: string = moment().format('YYYY-MM-DDTHH:mm:ssZ');
    public identificationType: IdentificationType;
    public identificationValue: string;
    public vatCondition: VATCondition;
    public grossIncome: string;
    public address: string;
    public city: string;
    public phones: string;
    public emails: string;
    public birthday: string;
    public observation: string;
    public allowCurrentAccount: boolean;
    public group: CompanyGroup;
    public employee: Employee;
    public country: Country;
    public floorNumber: string;
    public flat: string;
    public state: State;
    public addressNumber: string;
    public transport: Transport;
    public creationUser: User;
    public creationDate: string = moment().format('YYYY-MM-DDTHH:mm:ssZ');
    public updateUser: User;
    public updateDate: string;

    constructor() { }
}