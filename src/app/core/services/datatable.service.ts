import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { CurrencyPipe } from '@angular/common';
import { Injectable } from '@angular/core';
import { Config } from 'app/app.config';
import { RoundNumberPipe } from 'app/shared/pipes/round-number.pipe';

@Injectable({
  providedIn: 'root',
})
export class DatatableService {
  private roundNumberPipe: RoundNumberPipe = new RoundNumberPipe();
  private currencyPipe: CurrencyPipe = new CurrencyPipe('es-Ar');
  public columns: any[];
  public service: any;

  constructor(service: any, columns: any[]) {
    this.columns = columns;
    this.service = service;
  }

  public getValue(item: any, column: any): any {
    let val: string = 'item';
    let exists: boolean = true;
    let value: any = '';

    for (let a of column.name.split('.')) {
      val += '.' + a;
      if (exists && !eval(val)) {
        exists = false;
      }
    }

    if (exists) {
      switch (column.datatype) {
        case 'number':
          value = this.roundNumberPipe.transform(eval(val));
          break;
        case 'currency':
          value = this.currencyPipe.transform(
            this.roundNumberPipe.transform(eval(val)),
            'USD',
            'symbol-narrow',
            '1.2-2'
          );
          break;
        case 'percent':
          value = this.roundNumberPipe.transform(eval(val)) + '%';
          break;
        default:
          value = eval(val);
          break;
      }
    }
    return value;
  }

  public getItems(
    filters: any,
    currentPage: number,
    itemsPerPage: number,
    sort: any,
    group: any = null
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      let timezone = '-03:00';
      if (Config.timezone && Config.timezone !== '') {
        timezone = Config.timezone.split('UTC')[1];
      }

      // Construcción del filtro
      let match = `{`;
      for (let i = 0; i < this.columns.length; i++) {
        if (this.columns[i].visible || this.columns[i].required) {
          let value = filters[this.columns[i].name];
          if (value != undefined && value != null && value != '') {
            if (this.columns[i].defaultFilter) {
              match += `"${this.columns[i].name}": ${this.columns[i].defaultFilter}`;
            } else {
              if (this.columns[i].datatype !== 'boolean') {
                match += `"${this.columns[i].name}": { "$regex": "${value}", "$options": "i"}`;
              } else {
                match += `"${this.columns[i].name}": ${value}`;
              }
            }
            if (i < this.columns.length - 1) {
              match += ',';
            }
          }
        }
      }
      if (match.charAt(match.length - 1) === ',') {
        match = match.substring(0, match.length - 1);
      }
      match += `}`;
      match = JSON.parse(match);

      // Construcción del proyecto
      let project = `{`;
      let j = 0;
      for (let i = 0; i < this.columns.length; i++) {
        if (this.columns[i].visible || this.columns[i].required) {
          if (j > 0) {
            project += `,`;
          }
          j++;
          if (!this.columns[i].project) {
            if (
              this.columns[i].datatype !== 'string' &&
              this.columns[i].datatype !== 'boolean'
            ) {
              if (this.columns[i].datatype === 'date') {
                project += `"${this.columns[i].name}": { "$dateToString": { "date": "$${this.columns[i].name}", "format": "%d/%m/%Y", "timezone": "${timezone}" }}`;
              } else {
                project += `"${this.columns[i].name}": { "$toString" : "$${this.columns[i].name}" }`;
              }
            } else {
              project += `"${this.columns[i].name}": 1`;
            }
          } else {
            project += `"${this.columns[i].name}": ${this.columns[i].project}`;
          }
        }
      }
      project += `}`;
      project = JSON.parse(project);

      // Agrupamiento
      if (!group) {
        group = {
          _id: null,
          count: { $sum: 1 },
          items: { $push: '$$ROOT' },
        };
      }

      let page = currentPage > 0 ? currentPage - 1 : 0;

      this.service
        .getAll({
          project,
          match,
          sort,
          group,
          limit: itemsPerPage,
          skip: !isNaN(page * itemsPerPage) ? page * itemsPerPage : 0,
        })
        .subscribe(
          (result: any) => resolve(result),
          (error: any) => reject(error)
        );
    });
  }

  public getColumnsVisibles(): number {
    return this.columns.filter((column) => column.visible).length;
  }

  public drop(event: CdkDragDrop<string[]>): void {
    moveItemInArray(this.columns, event.previousIndex, event.currentIndex);
  }
}
