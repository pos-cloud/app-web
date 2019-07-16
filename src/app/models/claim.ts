import { User } from './user';

import * as moment from 'moment';
import 'moment/locale/es';

export class Claim {

    public _id: string;
    public name: string = '';
    public description: string = '';
    public type: ClaimType = ClaimType.Suggestion;
    public priority: ClaimPriority = ClaimPriority.Low;
    public author: string = '';
    public email: string = '';
    public listName: string = '';
    public creationUser: User;
    public creationDate: string = moment().format('YYYY-MM-DDTHH:mm:ssZ');
    public updateUser: User;
    public updateDate: string;

	constructor () {}
}

export enum ClaimPriority {
    High = <any> "Alta",
    Half = <any> "Media",
    Low = <any> "Baja",
}

export enum ClaimType {
    Suggestion = <any> "Sugerencia",
    Improvement = <any> "Mejora",
    Err = <any> "Error",
    Implementation = <any> "Nueva Implementación",
}