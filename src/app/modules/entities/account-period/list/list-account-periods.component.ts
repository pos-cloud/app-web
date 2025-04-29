import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { IAttribute, IButton } from '@types';
import { DatatableModule } from 'app/components/datatable/datatable.module';
import { DatatableComponent } from '../../../../components/datatable/datatable.component';
import { AccountPeriodService } from '../../../../core/services/account-period.service';

@Component({
  selector: 'app-list-account-periods',
  templateUrl: './list-account-periods.component.html',
  standalone: true,
  imports: [DatatableModule],
})
export class ListAccountPeriodsComponent {
  public title: string = 'account-periods';
  public loading: boolean = false;
  public sort = { status: 1 };
  public columns: IAttribute[] = [
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
      name: 'status',
      visible: true,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: null,
      align: 'left',
      required: false,
    },
    {
      name: 'startDate',
      project: `{ "$dateToString": { "date": "$startDate", "format": "%d/%m/%Y", "timezone": "-03:00" } }`,
      visible: true,
      filter: true,
      datatype: 'string',
      align: 'left',
    },
    {
      name: 'endDate',
      project: `{ "$dateToString": { "date": "$endDate", "format": "%d/%m/%Y", "timezone": "-03:00" } }`,
      visible: true,
      filter: true,
      datatype: 'string',
      align: 'left',
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
  public rowButtons: IButton[] = [
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
  public headerButtons: IButton[] = [
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

  // EXCEL
  @ViewChild(DatatableComponent) datatableComponent: DatatableComponent;

  constructor(public _service: AccountPeriodService, private _router: Router) {}

  public async emitEvent(event) {
    this.openModal(event.op, event.obj);
  }

  public async openModal(op: string, obj: any) {
    switch (op) {
      case 'view':
        this._router.navigateByUrl('entities/account-periods/view/' + obj._id);
        break;
      case 'add':
        this._router.navigateByUrl('entities/account-periods/add');
        break;
      case 'update':
        this._router.navigateByUrl('entities/account-periods/update/' + obj._id);
        break;
      case 'delete':
        this._router.navigateByUrl('entities/account-periods/delete/' + obj._id);
        break;
      default:
    }
  }
}
