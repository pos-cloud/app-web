import { Component, ViewChild, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';

import { NgbAlertConfig } from '@ng-bootstrap/ng-bootstrap';

import { CurrencyValueService } from '../../../core/services/currency-value.service';

import { IAttribute, IButton } from '@types';
import { DatatableComponent } from 'app/components/datatable/datatable.component';

@Component({
  selector: 'app-list-currency-values',
  templateUrl: './list-currency-value.component.html',
  providers: [NgbAlertConfig],
  encapsulation: ViewEncapsulation.None,
})
export class ListCurrencyValueComponent {
  public title: string;
  public sort = { name: 1 }; // Ordenamos por nombre en lugar de 'currency'
  public columns: IAttribute[];
  public pathLocation: string[] = [];
  public loading: boolean = false;
  public headerButtons: IButton[];
  public rowButtons: IButton[];

  @ViewChild(DatatableComponent) datatableComponent: DatatableComponent;

  constructor(
    public _service: CurrencyValueService,
    private _router: Router
  ) {
    this.columns = [
      {
        name: 'name', // Cambiamos 'currency' a 'name' para mostrar el nombre de la moneda
        visible: true,
        disabled: false,
        filter: true,
        datatype: 'string',
        project: null,
        align: 'left',
        required: true,
      },
      {
        name: 'value',
        visible: true,
        disabled: false,
        filter: true,
        datatype: 'number',
        project: null,
        align: 'center',
        required: true,
      },
    ];
    this.rowButtons = [
      {
        title: 'view',
        class: 'btn btn-success btn-sm',
        icon: 'fa fa-eye',
        click: `this.emitEvent('view', item)`,
      },
      {
        title: 'update',
        class: 'btn btn-primary btn-sm',
        icon: 'fa fa-pencil',
        click: `this.emitEvent('update', item)`,
      },
      {
        title: 'delete',
        class: 'btn btn-danger btn-sm',
        icon: 'fa fa-trash-o',
        click: `this.emitEvent('delete', item)`,
      },
    ];
    this.headerButtons = [
      {
        title: 'add',
        class: 'btn btn-light',
        icon: 'fa fa-plus',
        click: `this.emitEvent('add', null)`,
      },
      {
        title: 'refresh',
        class: 'btn btn-light',
        icon: 'fa fa-refresh',
        click: `this.refresh()`,
      },
    ];
    this.title = 'Valores de Moneda';
  }

  public async emitEvent(event) {
    this.openModal(event.op, event.obj);
  }

  public async openModal(op: string, obj: any) {
    switch (op) {
      case 'view':
        this._router.navigateByUrl('entities/currency-values/view/' + obj._id);
        break;
      case 'update':
        this._router.navigateByUrl('entities/currency-values/update/' + obj._id);
        break;
      case 'delete':
        this._router.navigateByUrl('entities/currency-values/delete/' + obj._id);
        break;
      case 'add':
        this._router.navigateByUrl('entities/currency-values/add');
        break;
    }
  }
}
