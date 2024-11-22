import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NgbAlertConfig } from '@ng-bootstrap/ng-bootstrap';
import { IAttribute, IButton } from '@types';
import { DatatableComponent } from 'app/components/datatable/datatable.component';
import { ResourceService } from '../resource.service';

@Component({
  selector: 'app-list-resources',
  templateUrl: './list-resource.component.html',
})
export class ListResourcesComponent {
  public title: string = 'Recursos';
  public sort = { name: 1 };
  public columns:IAttribute[];;
  public pathLocation: string[];
  public loading: boolean = false;
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

  constructor(
    public _service: ResourceService,
    private _router: Router,
    public _alertConfig: NgbAlertConfig
  ) {
    this.columns = [
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
          name: 'file',
          visible: true,
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
          project: null,
          align: 'left',
          required: false,
        },
      ];
  }

  public async emitEvent(event) {
    this.openModal(event.op, event.obj, event.items);
  }

  public async openModal(op: string, obj: any, items) {
    let currentUrl;
    switch (op) {
      case 'view':
        currentUrl = encodeURIComponent(this._router.url);
        this._router.navigate(['/entities/resources/view', obj._id], {
          queryParams: { returnURL: currentUrl },
        });
        break;
      case 'add':
        currentUrl = encodeURIComponent(this._router.url);
        this._router.navigate(['/entities/resources/add'], {
          queryParams: { returnURL: currentUrl },
        });
        break;
      case 'update':
        currentUrl = encodeURIComponent(this._router.url);
        this._router.navigate(['/entities/resources/update', obj._id], {
          queryParams: { returnURL: currentUrl },
        });
        break;
      case 'delete':
        currentUrl = encodeURIComponent(this._router.url);
        this._router.navigate(['/entities/resources/delete', obj._id], {
          queryParams: { returnURL: currentUrl },
        });
        break;
      default:
    }
  }

  public refresh() {
    this.datatableComponent.refresh();
  }
}
