import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { LocationService } from '@core/services/location.service';

import { IAttribute, IButton } from '@types';
import { DatatableComponent } from 'app/components/datatable/datatable.component';
import { DatatableModule } from 'app/components/datatable/datatable.module';

@Component({
  selector: 'app-list-location',
  templateUrl: './list-location.component.html',
  standalone: true,
  imports: [DatatableModule],
})
export class ListLocationComponent {
  public title: string;
  public sort = { description: 1 };
  public columns: IAttribute[];
  public loading: boolean = false;
  public headerButtons: IButton[];
  public rowButtons: IButton[];

  @ViewChild(DatatableComponent) datatableComponent: DatatableComponent;

  constructor(public _service: LocationService, private _router: Router) {
    this.columns = [
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
        name: 'deposit.name',
        visible: true,
        disabled: false,
        filter: true,
        datatype: 'string',
        project: null,
        align: 'left',
        required: true,
      },
      {
        name: 'positionX',
        visible: true,
        disabled: false,
        filter: true,
        datatype: 'string',
        project: null,
        align: 'left',
        required: true,
      },
      {
        name: 'positionY',
        visible: true,
        disabled: false,
        filter: true,
        datatype: 'string',
        project: null,
        align: 'left',
        required: true,
      },
      {
        name: 'positionZ',
        visible: true,
        disabled: false,
        filter: true,
        datatype: 'string',
        project: null,
        align: 'left',
        required: true,
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
    this.title = 'location';
  }

  public async emitEvent(event) {
    this.openModal(event.op, event.obj);
  }

  public async openModal(op: string, obj: any) {
    switch (op) {
      case 'view':
        this._router.navigateByUrl('entities/location/view/' + obj._id);
        break;
      case 'update':
        this._router.navigateByUrl('entities/location/update/' + obj._id);
        break;
      case 'delete':
        this._router.navigateByUrl('entities/location/delete/' + obj._id);
        break;
      case 'add':
        this._router.navigateByUrl('entities/location/add');
        break;
    }
  }
}
