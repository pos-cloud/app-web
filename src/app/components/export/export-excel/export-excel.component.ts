import { Component, Input, EventEmitter, Output } from '@angular/core';
import { RoundNumberPipe } from 'app/pipes/round-number.pipe';
import { registerLocaleData } from '@angular/common';
import localeEsAr from '@angular/common/locales/es-AR';
registerLocaleData(localeEsAr, 'es-Ar');

import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';
import { TranslatePipe } from '@ngx-translate/core';
const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';

@Component({
  selector: 'app-export-excel',
  templateUrl: './export-excel.component.html',
  styleUrls: ['./export-excel.component.css'],
  providers: [ TranslatePipe ]
})
export class ExportExcelComponent {

  @Input() columns: any[];
  @Input() items: any[];
  @Input() title: string;
  @Input() loading: boolean;
  @Output() eventExport: EventEmitter<boolean> = new EventEmitter<boolean>();
  private roundNumberPipe: RoundNumberPipe = new RoundNumberPipe();

  constructor(
    private _translatePipe: TranslatePipe
  ) { }

  public export(): void {
    let data = [] ;

    for (let i = 0; i < this.items.length; i++) {
      const item = this.items[i];
      data[i] = {};
      for (let column of this.columns) {
        if(column.visible) {
          data[i][this._translatePipe.transform(column.name)] = this.getValue(item, column);
        }
      }
    }

    this.exportAsExcelFile(data, this.title);
  }

  public getValue(item, column): any {
    let val: string = 'item';
    let exists: boolean = true;
    let value: any = '';
    for(let a of column.name.split('.')) {
      val += '.'+a;
      if(exists && !eval(val)) {
        exists = false;
      }
    }
    if(exists) {
      switch(column.datatype) {
        case 'number':
          value = this.roundNumberPipe.transform(eval(val));
          break;
        case 'currency':
            value = this.roundNumberPipe.transform(eval(val));
          break;
        default:
            value = eval(val);
          break;
      }
    }
    return value;
  }

	public exportAsExcelFile(json: any[], excelFileName: string): void {
		const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(json);
		const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
		const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
		this.saveAsExcelFile(excelBuffer, excelFileName);
	}

	private saveAsExcelFile(buffer: any, fileName: string): void {
		const data: Blob = new Blob([buffer], {type: EXCEL_TYPE});
		FileSaver.saveAs(data, fileName + EXCEL_EXTENSION);
	}
}
