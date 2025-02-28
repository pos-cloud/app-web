import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

import { IAttribute, IButton } from '@types';
import { DatatableComponent } from 'app/components/datatable/datatable.component';
import { DatatableModule } from 'app/components/datatable/datatable.module';
import { UnitOfMeasurementService } from 'app/core/services/unit-of-measurement.service';

@Component({
  selector: 'app-list-unit-of-measurements',
  templateUrl: './list-unit-of-measurements.component.html',
  standalone: true,
  imports: [DatatableModule],
})
export class ListUnitOfMeasurementsComponent {
  public title: string = 'unit-of-measurements';
  public sort = { name: 1 };
  public columns: IAttribute[];
  public loading: boolean = false;
  public headerButtons: IButton[];
  public rowButtons: IButton[];

  @ViewChild(DatatableComponent) datatableComponent: DatatableComponent;

  constructor(public _service: UnitOfMeasurementService, private _router: Router) {
    this.columns = [
      {
        name: 'code',
        visible: true,
        disabled: false,
        filter: true,
        datatype: 'string',
        align: 'left',
        required: true,
      },
      {
        name: 'abbreviation',
        visible: true,
        disabled: false,
        filter: true,
        datatype: 'string',
        align: 'left',
        required: true,
      },
      {
        name: 'name',
        visible: true,
        disabled: false,
        filter: true,
        datatype: 'string',
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
  }

  public async emitEvent(event) {
    this.openModal(event.op, event.obj);
  }

  public async openModal(op: string, obj: any) {
    switch (op) {
      case 'view':
        this._router.navigateByUrl('entities/unit-of-measurements/view/' + obj._id);
        break;
      case 'update':
        this._router.navigateByUrl('entities/unit-of-measurements/update/' + obj._id);
        break;
      case 'delete':
        this._router.navigateByUrl('entities/unit-of-measurements/delete/' + obj._id);
        break;
      case 'add':
        this._router.navigateByUrl('entities/unit-of-measurements/add');
        break;
    }
  }
}
