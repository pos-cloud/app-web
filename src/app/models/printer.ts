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
    public row : number; //espacio entre filas del for
    public addPag : number; // addPage()
    public fields : [{
        type : string; //field,line,movArticle,movCash,movCancellation
        label : string; 
        value : string; //field,movArticle,movCash,movCancellation
        font : string; //courier,times,helvetica  solo si es field
        fontType : string; //normal,italic,bold,bolditalic solo si es field
        fontSize : number; 
        positionStartX : number;
        positionStartY : number;
        positionEndX : number; //line
        positionEndY : number; //line
        splitting : number; // ancho del string solo si es field
        colour : string; // 4,5,9
        position : PositionPrint;
    }];

    public creationUser: User;
    public creationDate: string = moment().format('YYYY-MM-DDTHH:mm:ssZ');
    public updateUser: User;
    public updateDate: string;
    
    constructor() { }
}

export enum PositionPrint {
    Header = <any> "Encabezado",
    Body = <any> "Cuerpo",
    Footer = <any> "Pie"
}

export enum TypeFields {
    Field = <any> "Etiqueta",
    Line = <any> "Linea",
    MovArticle = <any> "Articulo",
    MovCash = <any> "Dinero",
    MovCan = <any>"Cancelacion"
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