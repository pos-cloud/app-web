import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NgbAlertConfig } from '@ng-bootstrap/ng-bootstrap';
import { IButton } from 'app/util/buttons.interface';
import { DatatableComponent } from '../../datatable/datatable.component';
import { attributes } from '../resource';
import { ResourceService } from '../resource.service';

@Component({
  selector: 'app-list-resources',
  templateUrl: './list-resources.component.html',
  styleUrls: ['./list-resources.component.css'],
})
export class ListResourcesComponent {
  public title: string = 'Recursos';
  public sort = { name: 1 };
  public columns = attributes;
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
  ) {}

  public async emitEvent(event) {
    this.openModal(event.op, event.obj, event.items);
  }

  public async openModal(op: string, obj: any, items) {
    let currentUrl;
    switch (op) {
      case 'view':
        currentUrl = encodeURIComponent(this._router.url);
        this._router.navigate(['/admin/resources/view', obj._id], {
          queryParams: { returnURL: currentUrl },
        });
        break;
      case 'add':
        currentUrl = encodeURIComponent(this._router.url);
        this._router.navigate(['/admin/resources/add'], {
          queryParams: { returnURL: currentUrl },
        });
        break;
      case 'update':
        currentUrl = encodeURIComponent(this._router.url);
        this._router.navigate(['/admin/resources/update', obj._id], {
          queryParams: { returnURL: currentUrl },
        });
        break;
      case 'delete':
        currentUrl = encodeURIComponent(this._router.url);
        this._router.navigate(['/admin/resources/delete', obj._id], {
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
