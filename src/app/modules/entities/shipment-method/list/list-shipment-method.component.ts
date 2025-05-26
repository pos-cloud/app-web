import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ShipmentMethodService } from '@core/services/shipment-method.service';
import { NgbAlertConfig } from '@ng-bootstrap/ng-bootstrap';
import { IAttribute, IButton } from '@types';
import { DatatableComponent } from 'app/components/datatable/datatable.component';
import { DatatableModule } from 'app/components/datatable/datatable.module';

@Component({
  selector: 'app-list-shipment-method',
  templateUrl: './list-shipment-method.component.html',
  standalone: true,
  imports: [DatatableModule],
})
export class ListShipmentMethodsComponent {
  public loading: boolean = false;
  public title: string = 'shipment-methods';
  public sort = { description: 1 };
  public columns: IAttribute[] = [
    {
      name: 'name',
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
      name: 'requireAddress',
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
      name: 'requireTable',
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
      name: 'article.description',
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
    {
      name: 'creationUser.name',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: null,
      align: 'left',
      required: false,
    },
    {
      name: 'updateUser.name',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: null,
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
  public rowButtons: IButton[] = [
    {
      title: 'view',
      class: 'btn btn-success btn-sm',
      icon: 'fa fa-eye',
      click: `this.emitEvent('view', item, null)`,
    },
    {
      title: 'update',
      class: 'btn btn-primary btn-sm',
      icon: 'fa fa-pencil',
      click: `this.emitEvent('update', item, null)`,
    },
    {
      title: 'delete',
      class: 'btn btn-danger btn-sm',
      icon: 'fa fa-trash-o',
      click: `this.emitEvent('delete', item, null)`,
    },
  ];

  @ViewChild(DatatableComponent) datatableComponent: DatatableComponent;

  constructor(public _service: ShipmentMethodService, private _router: Router, public _alertConfig: NgbAlertConfig) {}

  public async emitEvent(event) {
    this.redirect(event.op, event.obj);
  }

  public async redirect(op: string, obj: any) {
    switch (op) {
      case 'view':
        this._router.navigateByUrl('entities/shipment-methods/view/' + obj._id);
        break;
      case 'update':
        this._router.navigateByUrl('entities/shipment-methods/update/' + obj._id);
        break;
      case 'delete':
        this._router.navigateByUrl('entities/shipment-methods/delete/' + obj._id);
        break;
      case 'add':
        this._router.navigateByUrl('entities/shipment-methods/add');
        break;
    }
  }

  public refresh() {
    this.datatableComponent.refresh();
  }
}
