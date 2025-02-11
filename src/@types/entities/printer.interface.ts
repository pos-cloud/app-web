import { Activity } from '@types';

export interface Printer extends Activity {
  _id: string;
  name: string;
  origin: number;
  connectionURL: string;
  type: PrinterType;
  pageWidth: number;
  pageHigh: number;
  labelWidth: number;
  labelHigh: number;
  printIn: PrinterPrintIn;
  url: string;
  quantity: number;
  orientation: string; //hporizantal vertical
  row: number; //espacio entre filas del for
  addPag: number; // addPage()
  fields: [
    {
      type: string; //field,line,movArticle,movCash,movCancellation
      label: string;
      value: string; //field,movArticle,movCash,movCancellation
      font: string; //courier,times,helvetica  solo si es field
      fontType: string; //normal,italic,bold,bolditalic solo si es field
      fontSize: number;
      positionStartX: number;
      positionStartY: number;
      positionEndX: number; //line
      positionEndY: number; //line
      splitting: number; // ancho del string solo si es field
      colour: string; // 4,5,9
      position: PositionPrint;
    },
  ];
}

export enum PositionPrint {
  Header = <any>'Encabezado',
  Body = <any>'Cuerpo',
  Footer = <any>'Pie',
}

export enum TypeFields {
  Field = <any>'Etiqueta',
  Line = <any>'Linea',
  MovArticle = <any>'Articulo',
  MovCash = <any>'Dinero',
  MovCan = <any>'Cancelacion',
}

export enum PrinterPrintIn {
  Bar = <any>'Bar',
  Kitchen = <any>'Cocina',
  Label = <any>'Etiqueta',
  Counter = <any>'Mostrador',
  Voucher = <any>'Voucher',
}

export enum PrinterType {
  PDF = <any>'PDF',
  Commander = <any>'Comandera',
  Fiscal = <any>'Fiscal',
}
