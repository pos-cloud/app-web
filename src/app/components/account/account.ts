import { Model } from '../model/model.model';
import { IAttribute } from 'app/util/attribute.interface';

export class Account extends Model {

    public _id: string;
    public code : string;
    public description: string;
    public parent : Account;
    public type : Types;
    public mode : Modes;

    constructor() { super(); }

    static getAttributes(): IAttribute[] {
        return Model.getAttributes([
            {
                name: 'code',
                visible: true,
                filter: true,
                datatype: 'string',
                align: 'left',
            }, {
                name: 'description',
                visible: true,
                filter: true,
                datatype: 'string',
                align: 'left',
            }
        ])
    }
}

export enum Types {
    Asset = <any>"Activo",
    Passive = <any>"Pasivo",
    netWorth = <any>"Patrimonio Neto",
    Result = <any>"Resultado",
    Compensatory = <any>"Compensatoria",
    Other = <any>"Otro"
}

export enum Modes {
    Synthetic = <any>"Sintetico",
    Analytical = <any>"Analitico"
}

