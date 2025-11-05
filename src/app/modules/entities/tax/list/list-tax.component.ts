import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { TaxService } from '@core/services/tax.service';
import { NgbAlertConfig } from '@ng-bootstrap/ng-bootstrap';
import { IAttribute, IButton } from '@types';
import { DatatableComponent } from 'app/components/datatable/datatable.component';
import { DatatableModule } from 'app/components/datatable/datatable.module';

@Component({
  selector: 'app-list-tax',
  templateUrl: './list-tax.component.html',
  standalone: true,
  imports: [DatatableModule],
})
export class ListTaxComponent {
  public loading: boolean = false;
  public title: string = 'taxes';
  public sort = { name: 1 };

  public columns: IAttribute[] = [
    {
      name: 'code',
      visible: true,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: null,
      align: 'left',
      required: true,
    },
    {
      name: 'name',
      visible: true,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: null,
      align: 'left',
      required: true,
    },
    {
      name: 'taxBase',
      visible: true,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: null,
      align: 'left',
      required: true,
    },
    {
      name: 'percentage',
      visible: true,
      disabled: false,
      filter: true,
      datatype: 'number',
      project: null,
      align: 'left',
      required: true,
    },
    {
      name: 'amount',
      visible: true,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: null,
      align: 'left',
      required: true,
    },
    {
      name: 'classification',
      visible: true,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: null,
      align: 'left',
      required: true,
    },
    {
      name: 'type',
      visible: true,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: null,
      align: 'left',
      required: true,
    },
    {
      name: 'lastNumber',
      visible: true,
      disabled: false,
      filter: true,
      datatype: 'number',
      project: null,
      align: 'left',
      required: true,
    },
    {
      name: 'debitAccount.description',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: null,
      align: 'left',
      required: false,
    },
    {
      name: 'creditAccount.description',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: null,
      align: 'left',
      required: false,
    },
    {
      name: 'printer.name',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: null,
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

  constructor(public _service: TaxService, private _router: Router, public _alertConfig: NgbAlertConfig) {}

  public async emitEvent(event) {
    this.redirect(event.op, event.obj);
  }

  public async redirect(op: string, obj: any) {
    switch (op) {
      case 'view':
        this._router.navigateByUrl('entities/taxes/view/' + obj._id);
        break;
      case 'update':
        this._router.navigateByUrl('entities/taxes/update/' + obj._id);
        break;
      case 'delete':
        this._router.navigateByUrl('entities/taxes/delete/' + obj._id);
        break;
      case 'add':
        this._router.navigateByUrl('entities/taxes/add');
        break;
    }
  }

  public refresh() {
    this.datatableComponent.refresh();
  }
}
