export class Printer {

    public _id: string;
    public name: string;
    public origin: number = 0;
    public connectionURL: string;
    public type: PrinterType = PrinterType.PDF;
    public pageWidth: number;
    public pageHigh: number;
    public printIn: PrinterPrintIn = PrinterPrintIn.Counter;

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