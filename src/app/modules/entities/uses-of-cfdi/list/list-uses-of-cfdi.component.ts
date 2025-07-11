import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { UseOfCFDIService } from '@core/services/use-of-CFDI.service';
import { IButton } from '@types';
import { DatatableComponent } from 'app/components/datatable/datatable.component';
import { DatatableModule } from 'app/components/datatable/datatable.module';

@Component({
  selector: 'app-list-uses-of-cfdi',
  templateUrl: './list-uses-of-cfdi.component.html',
  standalone: true,
  imports: [DatatableModule],
})
export class ListUsesOfCFDIComponent {
  public title: string = 'uses-of-cfdi';
  public sort = { description: 1 };
  public columns = [
    {
      name: 'code',
      visible: true,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: null,
      align: 'left',
      required: false,
    },
    {
      name: 'description',
      visible: true,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: null,
      align: 'left',
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

  constructor(public _service: UseOfCFDIService, private _router: Router) {}

  public async emitEvent(event) {
    await this.openModal(event.op, event.obj);
  }

  public async openModal(op: string, obj: any) {
    switch (op) {
      case 'view':
        await this._router.navigate([`/entities/uses-of-cfdi/view/${obj._id}`]);
        break;
      case 'add':
        await this._router.navigate(['/entities/uses-of-cfdi/add']);
        break;
      case 'update':
        await this._router.navigate([`/entities/uses-of-cfdi/update/${obj._id}`]);
        break;
      case 'delete':
        await this._router.navigate([`/entities/uses-of-cfdi/delete/${obj._id}`]);
        break;
      default:
        break;
    }
  }

  public refresh() {
    this.datatableComponent.refresh();
  }
}
