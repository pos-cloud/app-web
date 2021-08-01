import { Model } from '../model/model.model';
import { IAttribute } from 'app/util/attribute.interface';
import { Article } from '../article/article';

export class BusinessRule extends Model {

    public _id: string;
    public name: string;
	public startDate: string;
	public endDate: string;
	public quantity : number;

	public discountAmount: number;
	public discountPercent: number;
	public article : Article;
	public newUser : boolean = false;

    constructor() { super(); }

    static getAttributes(): IAttribute[] {
        return Model.getAttributes([
            {
                name: 'name',
                visible: true,
                filter: true,
                datatype: 'string',
                align: 'left',
            }, {
                name: 'startDate',
                visible: true,
                filter: true,
                project: `{ "$dateToString": { "date": "$startDate", "format": "%d/%m/%Y", "timezone": "-03:00" } }`,
                datatype: 'string',
                align: 'left',
            },
            {
                name: 'endDate',
                visible: true,
                filter: true,
                project: `{ "$dateToString": { "date": "$endDate", "format": "%d/%m/%Y", "timezone": "-03:00" } }`,
                datatype: 'string',
                align: 'left',
            },
            {
                name: 'quantity',
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

