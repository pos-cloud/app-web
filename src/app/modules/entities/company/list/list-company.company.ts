import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CompanyService } from '@core/services/company.service';

import { CompanyType, IAttribute, IButton } from '@types';
import { DatatableComponent } from 'app/components/datatable/datatable.component';
import { DatatableModule } from 'app/components/datatable/datatable.module';

@Component({
  selector: 'app-list-companies',
  templateUrl: './list-company.component.html',
  standalone: true,
  imports: [DatatableModule],
})
export class ListCompanyComponent {
  public companyType: string;
  public title: string;
  public loading: boolean = false;
  public sort = { name: 1 };
  public type;
  public columns: IAttribute[] = [
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
      name: 'fantasyName',
      visible: true,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: null,
      align: 'left',
      required: false,
    },
    {
      name: 'identificationValue',
      visible: true,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: null,
      align: 'left',
      required: false,
    },
    {
      name: 'address',
      visible: true,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: null,
      align: 'left',
      required: true,
    },
    {
      name: 'addressNumber',
      visible: true,
      disabled: false,
      filter: true,
      datatype: 'string',
      align: 'left',
      required: false,
    },
    {
      name: 'city',
      visible: true,
      disabled: false,
      filter: true,
      datatype: 'string',
      align: 'left',
      required: false,
    },
    {
      name: 'phones',
      visible: true,
      disabled: false,
      filter: true,
      datatype: 'string',
      align: 'left',
      required: false,
    },
    {
      name: 'emails',
      visible: true,
      disabled: false,
      filter: true,
      datatype: 'string',
      align: 'left',
      required: false,
    },
    {
      name: 'birthday',
      visible: true,
      disabled: false,
      filter: true,
      datatype: 'date',
      project: `{ "$dateToString": { "date": "$birthday", "format": "%d/%m/%Y"} }`,
      align: 'left',
      required: false,
    },
    {
      name: 'allowCurrentAccount',
      visible: true,
      disabled: false,
      filter: true,
      datatype: 'string',
      align: 'left',
      required: false,
    },
    {
      name: 'observation',
      visible: true,
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
    {
      title: 'current-account1',
      class: 'btn btn-light btn-sm',
      icon: 'fa fa-book',
      click: `this.emitEvent('current-account1', item)`,
    },
    {
      title: 'current-account2',
      class: 'btn btn-light btn-sm',
      icon: 'fa fa-address-book',
      click: `this.emitEvent('current-account2', item)`,
    },
  ];

  @ViewChild(DatatableComponent) datatableComponent: DatatableComponent;

  constructor(public _service: CompanyService, private _router: Router, private route: ActivatedRoute) {
    this.route.url.subscribe(() => {
      const pathUrl = this._router.url.split('/');
      this.companyType = pathUrl[3];
      this.type = pathUrl[3] === 'client' ? CompanyType.Client : CompanyType.Provider;
      this.title = this.type;

      this.columns.push({
        name: 'type',
        visible: false,
        disabled: true,
        filter: false,
        datatype: 'string',
        defaultFilter: `{ "$eq": "${this.type}" }`,
        project: null,
        align: 'left',
        required: true,
      });

      this.datatableComponent.refresh();
    });
  }

  public async emitEvent(event) {
    this.openModal(event.op, event.obj);
  }

  public async openModal(op: string, obj: any) {
    switch (op) {
      case 'view':
        this._router.navigateByUrl('entities/companies/view/' + this.companyType + '/' + obj._id);
        break;

      case 'update':
        this._router.navigateByUrl('entities/companies/update/' + this.companyType + '/' + obj._id);
        break;
      case 'delete':
        this._router.navigateByUrl('entities/companies/delete/' + this.companyType + '/' + obj._id);
        break;
      case 'add':
        this._router.navigateByUrl('entities/companies/add/' + this.companyType);
        break;
      case 'current-account2':
        this._router.navigateByUrl('reports/current-account/' + obj._id);
        break;
      case 'current-account1':
        this._router.navigateByUrl('admin/cuentas-corrientes?companyId=' + obj._id + '&companyType=' + this.type);
        break;
    }
  }
}
