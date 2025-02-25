import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

import { IAttribute, IButton } from '@types';
import { DatatableComponent } from 'app/components/datatable/datatable.component';
import { DatatableModule } from 'app/components/datatable/datatable.module';
import { VariantValueService } from '../../../core/services/variant-value.service';

@Component({
  selector: 'app-list-variant-values',
  templateUrl: './list-variant-values.component.html',
  standalone: true,
  imports: [DatatableModule],
})
export class ListVariantValuesComponent {
  public title: string;
  public sort = { name: 1 };
  public columns: IAttribute[];
  public pathLocation: string[] = [];
  public loading: boolean = false;
  public headerButtons: IButton[];
  public rowButtons: IButton[];

  @ViewChild(DatatableComponent) datatableComponent: DatatableComponent;

  constructor(
    public _service: VariantValueService,
    private _router: Router
  ) {
    this.columns = [
      {
        name: 'description',
        visible: true,
        disabled: false,
        filter: true,
        datatype: 'string',
        align: 'left',
        required: true,
      },
      {
        name: 'order',
        visible: true,
        disabled: false,
        filter: true,
        datatype: 'number',
        align: 'center',
        required: true,
      },
      {
        name: 'creationUser.name',
        visible: false,
        disabled: false,
        filter: true,
        datatype: 'string',
        align: 'left',
        required: false,
      },
      {
        name: 'updateUser.name',
        visible: false,
        disabled: false,
        filter: true,
        datatype: 'string',
        align: 'left',
        required: false,
      },
      {
        name: 'creationDate',
        visible: false,
        disabled: false,
        filter: true,
        datatype: 'date',
        project: `{ "$dateToString": { "date": "$creationDate", "format": "%d/%m/%Y %H:%M", "timezone": "-03:00" } }`,
        align: 'left',
        required: false,
      },
      {
        name: 'updateDate',
        visible: false,
        disabled: false,
        filter: true,
        datatype: 'string',
        project: `{ "$dateToString": { "date": "$updateDate", "format": "%d/%m/%Y %H:%M", "timezone": "-03:00" } }`,
        align: 'left',
        required: false,
      },
      {
        name: 'operationType',
        visible: false,
        disabled: true,
        filter: false,
        datatype: 'string',
        defaultFilter: `{ "$ne": "D" }`,
        project: null,
        align: 'left',
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
    this.title = 'Valores de Variantes';
  }

  public async refresh() {
    if (this.datatableComponent) {
      this.datatableComponent.ngOnInit();
    }
  }

  public async emitEvent(event) {
    this.openModal(event.op, event.obj);
  }

  public async openModal(op: string, obj: any) {
    switch (op) {
      case 'view':
        this._router.navigateByUrl('entities/variant-values/view/' + obj._id);
        break;
      case 'update':
        this._router.navigateByUrl('entities/variant-values/update/' + obj._id);
        break;
      case 'delete':
        this._router.navigateByUrl('entities/variant-values/delete/' + obj._id);
        break;
      case 'add':
        this._router.navigateByUrl('entities/variant-values/add');
        break;
    }
  }
}
