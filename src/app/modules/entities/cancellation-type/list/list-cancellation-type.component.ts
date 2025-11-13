import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

import { CancellationTypeService } from '@core/services/cancellation-type.service';

import { IAttribute, IButton } from '@types';
import { DatatableComponent } from 'app/components/datatable/datatable.component';
import { DatatableModule } from 'app/components/datatable/datatable.module';

@Component({
  selector: 'app-list-cancellation-type',
  templateUrl: './list-cancellation-type.component.html',
  standalone: true,
  imports: [DatatableModule],
})
export class ListCancellationTypeComponent {
  public title: string = 'cancellation-type';
  public sort = { name: 1 };
  public columns: IAttribute[];
  public loading: boolean = false;
  public headerButtons: IButton[];
  public rowButtons: IButton[];

  @ViewChild(DatatableComponent) datatableComponent: DatatableComponent;

  constructor(public _service: CancellationTypeService, private _router: Router) {
    this.columns = [
      {
        name: 'origin.transactionMovement',
        visible: true,
        disabled: false,
        filter: true,
        defaultFilter: null,
        datatype: 'string',
        project: null,
        align: 'left',
        required: false,
      },
      {
        name: 'origin.name',
        visible: true,
        disabled: false,
        filter: true,
        defaultFilter: null,
        datatype: 'string',
        project: null,
        align: 'left',
        required: false,
      },
      {
        name: 'stateOrigin',
        visible: true,
        disabled: false,
        filter: true,
        defaultFilter: null,
        datatype: 'string',
        project: null,
        align: 'left',
        required: false,
      },
      {
        name: 'destination.transactionMovement',
        visible: true,
        disabled: false,
        filter: true,
        defaultFilter: null,
        datatype: 'string',
        project: null,
        align: 'left',
        required: false,
      },
      {
        name: 'destination.name',
        visible: true,
        disabled: false,
        filter: true,
        defaultFilter: null,
        datatype: 'string',
        project: null,
        align: 'left',
        required: false,
      },
      {
        name: 'requestAutomatic',
        visible: true,
        disabled: false,
        filter: true,
        defaultFilter: null,
        datatype: 'boolean',
        project: null,
        align: 'left',
        required: false,
      },
      {
        name: 'automaticSelection',
        visible: true,
        disabled: false,
        filter: true,
        defaultFilter: null,
        datatype: 'boolean',
        project: null,
        align: 'left',
        required: false,
      },
      {
        name: 'modifyBalance',
        visible: true,
        disabled: false,
        filter: true,
        defaultFilter: null,
        datatype: 'boolean',
        project: null,
        align: 'left',
        required: false,
      },
      {
        name: 'requestStatusOrigin',
        visible: true,
        disabled: false,
        filter: true,
        defaultFilter: null,
        datatype: 'string',
        project: null,
        align: 'left',
        required: false,
      },
      {
        name: 'requestCompany',
        visible: true,
        disabled: false,
        filter: true,
        defaultFilter: null,
        datatype: 'boolean',
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
        datatype: 'date',
        project: `{ "$dateToString": { "date": "$updateDate", "format": "%d/%m/%Y %H:%M", "timezone": "-03:00" } }`,
        align: 'left',
        required: false,
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
  }

  public async emitEvent(event) {
    this.openModal(event.op, event.obj);
  }

  public async openModal(op: string, obj: any) {
    switch (op) {
      case 'view':
        this._router.navigateByUrl('entities/cancellation-types/view/' + obj._id);
        break;
      case 'update':
        this._router.navigateByUrl('entities/cancellation-types/update/' + obj._id);
        break;
      case 'delete':
        this._router.navigateByUrl('entities/cancellation-types/delete/' + obj._id);
        break;
      case 'add':
        this._router.navigateByUrl('entities/cancellation-types/add');
        break;
    }
  }
}
