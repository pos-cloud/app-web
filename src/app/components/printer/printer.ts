import * as moment from 'moment';

import {User} from '../user/user';

export class Printer {
  _id: string;
  name: string;
  origin: number = 0;
  connectionURL: string;
  type: PrinterType = PrinterType.PDF;
  pageWidth: number;
  pageHigh: number;
  printIn: PrinterPrintIn = PrinterPrintIn.Counter;
  url: string;
  quantity: number = 1;
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
  creationUser: User;
  creationDate: string = moment().format('YYYY-MM-DDTHH:mm:ssZ');
  updateUser: User;
  updateDate: string;

  constructor() {}
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
