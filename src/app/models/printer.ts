export class Printer {

    public _id: string;
    public name: string;
    public origin: number = 0;
    public connectionURL: string = "C:\\printhtml.exe";
    public type: PrinterType = PrinterType.Counter;

    constructor() {}
}

export enum PrinterType {
    Bar = <any>"Bar",
    Kitchen = <any>"Cocina",
    Counter = <any>"Mostrador"
}