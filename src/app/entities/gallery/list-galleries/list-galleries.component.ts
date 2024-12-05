import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NgbAlertConfig } from '@ng-bootstrap/ng-bootstrap';
import { IAttribute, IButton } from '@types';
import { DatatableComponent } from 'app/components/datatable/datatable.component';
import { GalleryService } from '../../../core/services/gallery.service';

@Component({
  selector: 'app-list-galleries',
  templateUrl: './list-galleries.component.html',
})
export class ListGalleriesComponent {
  public title: string = 'Galería';
  public sort = { name: 1 };
  public columns: IAttribute[];
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
      class: 'btn btn-secondary btn-sm',
      icon: 'fa fa-binoculars',
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
    public _service: GalleryService,
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
        name: 'colddown',
        visible: false,
        disabled: false,
        filter: true,
        datatype: 'number',
        project: null,
        align: 'right',
        required: false,
      },
      {
        name: 'barcode',
        visible: true,
        disabled: false,
        filter: true,
        datatype: 'boolean',
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
  }

  public async emitEvent(event) {
    this.redirect(event.op, event.obj);
  }

  public async redirect(op: string, obj: any) {
    switch (op) {
      case 'view':
        this._router.navigateByUrl('entities/galleries/view/' + obj._id);
        break;
      case 'update':
        this._router.navigateByUrl('entities/galleries/update/' + obj._id);
        break;
      case 'delete':
        this._router.navigateByUrl('entities/galleries/delete/' + obj._id);
        break;
      case 'add':
        this._router.navigateByUrl('entities/galleries/add');
        break;
    }
  }

  public refresh() {
    this.datatableComponent.refresh();
  }
}
