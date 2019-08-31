import { User } from './user';

import * as moment from 'moment';
import 'moment/locale/es';

export class Printer {

    public _id: string;
    public name: string;
    public origin: number = 0;
    public connectionURL: string;
    public type: PrinterType = PrinterType.PDF;
    public pageWidth: number;
    public pageHigh: number;
    public printIn: PrinterPrintIn = PrinterPrintIn.Counter;

    public orientation : string; //hporizantal vertical
    public row : Number; //espacio entre filas del for
    public addPag : Number; // addPage()
    public fields : [{
        type : string; //field,line,movArticle,movCash,movCancellation
        label : string;
        value : string;
        font : string; //courier,times,helvetica
        fontType : string; //normal,italic,bold,bolditalic
        fontSize : Number; 
        positionStartX : Number;
        positionStartY : Number;
        positionEndX : Number;
        positionEndY : Number;
        splitting : Number;
        colour : string // 4,5,9
    }];

    public creationUser: User;
    public creationDate: string = moment().format('YYYY-MM-DDTHH:mm:ssZ');
    public updateUser: User;
    public updateDate: string;
    
    constructor() { }
}

export enum PrinterPrintIn {
    Bar = <any>"Bar",
    Kitchen = <any>"Cocina",
    Label = <any>"Etiqueta",
    Counter = <any>"Mostrador"
}

export enum PrinterType {
    PDF = <any>"PDF",
    Commander = <any>"Comandera",
    Fiscal = <any>"Fiscal"
}