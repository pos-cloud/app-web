import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { PrinterService } from '@core/services/printer.service';
import { IButton } from '@types';
import { DatatableComponent } from 'app/components/datatable/datatable.component';
import { DatatableModule } from 'app/components/datatable/datatable.module';

@Component({
  selector: 'app-list-printers',
  templateUrl: './list-printers.component.html',
  standalone: true,
  imports: [DatatableModule],
})
export class ListPrintersComponent {
  public title: string = 'printers';
  public sort = { name: 1 };
  public columns = [
    {
      name: 'name',
      visible: true,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: null,
      align: 'left',
      required: false,
    },
    {
      name: 'printIn',
      visible: true,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: null,
      align: 'left',
      required: false,
    },
    {
      name: 'origin',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'number',
      project: null,
      align: 'center',
      required: false,
    },
    {
      name: 'pageWidth',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'number',
      project: null,
      align: 'center',
      required: false,
    },
    {
      name: 'pageHigh',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'number',
      project: null,
      align: 'center',
      required: false,
    },
    {
      name: 'labelWidth',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'number',
      project: null,
      align: 'center',
      required: false,
    },
    {
      name: 'labelHigh',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'number',
      project: null,
      align: 'center',
      required: false,
    },
    {
      name: 'url',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: null,
      align: 'left',
      required: false,
    },
    {
      name: 'quantity',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'number',
      project: null,
      align: 'center',
      required: false,
    },
    {
      name: 'orientation',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: null,
      align: 'left',
      required: false,
    },
    {
      name: 'row',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'number',
      project: null,
      align: 'center',
      required: false,
    },
    {
      name: 'addPag',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'number',
      project: null,
      align: 'center',
      required: false,
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
      name: '_id',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: `{ "$toString": "$_id" }`,
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

  public rowButtons: IButton[] = [
    {
      title: 'view',
      icon: 'fa fa-eye',
      class: 'btn btn-success btn-sm',
      click: `this.emitEvent('view', item)`,
    },
    {
      title: 'update',
      icon: 'fa fa-pencil',
      class: 'btn btn-primary btn-sm',
      click: `this.emitEvent('update', item)`,
    },
    {
      title: 'delete',
      icon: 'fa fa-trash-o',
      class: 'btn btn-danger btn-sm',
      click: `this.emitEvent('delete', item)`,
    },
    {
      title: 'Copiar',
      class: 'btn btn-light btn-sm',
      icon: ' fa fa-copy',
      click: `this.emitEvent('copy', item, null)`,
    },
  ];

  public headerButtons: IButton[] = [
    {
      title: 'add',
      icon: 'fa fa-plus',
      class: 'btn btn-light',
      click: `this.emitEvent('add', null)`,
    },
    {
      title: 'refresh',
      icon: 'fa fa-refresh',
      class: 'btn btn-light',
      click: `this.refresh()`,
    },
  ];

  @ViewChild(DatatableComponent) datatableComponent: DatatableComponent;

  constructor(public _service: PrinterService, private _router: Router) {}

  public async emitEvent(event) {
    await this.openModal(event.op, event.obj);
  }

  public async openModal(op: string, obj: any) {
    switch (op) {
      case 'view':
        await this._router.navigate([`/entities/printers/view/${obj._id}`]);
        break;
      case 'add':
        await this._router.navigate(['/entities/printers/add']);
        break;

      case 'update':
        await this._router.navigate([`/entities/printers/update/${obj._id}`]);
        break;
      case 'delete':
        await this._router.navigate([`/entities/printers/delete/${obj._id}`]);
        break;
      case 'copy':
        await this._router.navigate([`/entities/printers/copy/${obj._id}`]);
        break;
      default:
        break;
    }
  }

  public refresh() {
    this.datatableComponent.refresh();
  }
}
