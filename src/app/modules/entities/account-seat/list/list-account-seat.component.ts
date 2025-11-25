import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

import { IAttribute, IButton } from '@types';
import { DatatableComponent } from 'app/components/datatable/datatable.component';
import { DatatableModule } from 'app/components/datatable/datatable.module';
import { AccountSeatService } from '../../../../core/services/account-seat.service';

@Component({
  selector: 'app-list-account-seat',
  templateUrl: './list-account-seat.component.html',
  standalone: true,
  imports: [DatatableModule],
})
export class ListAccountSeatComponent {
  public title: string;
  public sort = { description: 1 };
  public columns: IAttribute[];
  public loading: boolean = false;
  public headerButtons: IButton[];
  public rowButtons: IButton[];

  @ViewChild(DatatableComponent) datatableComponent: DatatableComponent;

  constructor(public _service: AccountSeatService, private _router: Router) {
    this.columns = [
      {
        name: 'date',
        visible: true,
        disabled: false,
        filter: true,
        datatype: 'date',
        project: `{ "$dateToString": { "date": "$date", "format": "%d/%m/%Y" } }`,
        align: 'center',
        required: true,
      },
      {
        name: 'period.description',
        visible: true,
        disabled: false,
        filter: true,
        datatype: 'string',
        align: 'center',
        required: true,
      },
      {
        name: 'observation',
        visible: false,
        filter: true,
        datatype: 'string',
        align: 'left',
      },
      {
        name: 'transaction.type.name',
        visible: true,
        filter: true,
        datatype: 'string',
        align: 'left',
      },
      {
        name: 'transaction.type.transactionMovement',
        visible: true,
        filter: true,
        datatype: 'string',
        align: 'left',
      },
      {
        name: 'transaction.origin',
        visible: true,
        filter: true,
        datatype: 'number',
        align: 'left',
      },
      {
        name: 'transaction.letter',
        visible: true,
        filter: true,
        datatype: 'string',
        align: 'left',
      },
      {
        name: 'transaction.number',
        visible: true,
        filter: true,
        datatype: 'number',
        align: 'left',
      },
      {
        name: 'transaction.company.name',
        visible: true,
        filter: true,
        datatype: 'string',
        align: 'left',
      },

      {
        name: 'transaction.totalPrice',
        visible: true,
        filter: true,
        datatype: 'currency',
        align: 'right',
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
    this.title = 'account-seats';
  }

  public async emitEvent(event) {
    this.openModal(event.op, event.obj);
  }

  public async openModal(op: string, obj: any) {
    switch (op) {
      case 'view':
        this._router.navigateByUrl('entities/account-seat/view/' + obj._id);
        break;
      case 'update':
        this._router.navigateByUrl('entities/account-seat/update/' + obj._id);
        break;
      case 'delete':
        this._router.navigateByUrl('entities/account-seat/delete/' + obj._id);
        break;
      case 'add':
        this._router.navigateByUrl('entities/account-seat/add');
        break;
    }
  }
}
