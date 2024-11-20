import { Component, ViewChild, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';

import { NgbAlertConfig } from '@ng-bootstrap/ng-bootstrap';

import { MakeService } from '../make.service';

import { IButton } from '@types';
import { DatatableComponent } from 'app/components/datatable/datatable.component';
import { attributes } from '../make.model';

@Component({
  selector: 'app-list-makes',
  templateUrl: './list-makes.component.html',
  providers: [NgbAlertConfig],
  encapsulation: ViewEncapsulation.None,
})
export class ListMakesComponent {
  public title: string;
  public sort = { description: 1 };
  public columns = attributes;
  public pathLocation: string[];
  public priceListId: string;
  public loading: boolean = false;
  public headerButtons: IButton[];
  public rowButtons: IButton[];

  @ViewChild(DatatableComponent) datatableComponent: DatatableComponent;

  constructor(
    public _service: MakeService,
    private _router: Router
  ) {
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
    this.title = 'Marcas';
  }

  public async emitEvent(event) {
    this.openModal(event.op, event.obj);
  }

  public async openModal(op: string, obj: any) {
    switch (op) {
      case 'view':
        this._router.navigateByUrl('entities/makes/view/' + obj._id);
        break;
      case 'update':
        this._router.navigateByUrl('entities/makes/update/' + obj._id);
        break;
      case 'delete':
        this._router.navigateByUrl('entities/makes/delete/' + obj._id);
        break;
      case 'add':
        this._router.navigateByUrl('entities/makes/add');
        break;
    }
  }
}
