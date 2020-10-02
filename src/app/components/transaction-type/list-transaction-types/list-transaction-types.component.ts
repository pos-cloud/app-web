import { Component, ViewEncapsulation, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DatatableComponent } from '../../datatable/datatable.component';
import { Router } from '@angular/router';
import { TransactionTypeService } from '../transaction-type.service';
import { TransactionType } from '../transaction-type';

@Component({
  selector: 'app-list-transaction-types',
  templateUrl: './list-transaction-types.component.html',
  styleUrls: ['./list-transaction-types.component.scss'],
  encapsulation: ViewEncapsulation.None
})

export class ListTransactionTypesComponent {

  public title: string = 'transaction-types';
  public sort = { "name": 1 };
  public columns = TransactionType.getAttributes();
  public rowButtons: {
    title: string,
    class: string,
    icon: string,
    click: string
  }[] = [{
    title: 'view',
    class: 'btn btn-success btn-sm',
    icon: 'fa fa-eye',
    click: `this.emitEvent('view', item)`
  }, {
    title: 'update',
    class: 'btn btn-primary btn-sm',
    icon: 'fa fa-pencil',
    click: `this.emitEvent('update', item)`
  }, {
    title: 'delete',
    class: 'btn btn-danger btn-sm',
    icon: 'fa fa-trash-o',
    click: `this.emitEvent('delete', item)`
  }];
  public headerButtons: {
    title: string,
    class: string,
    icon: string,
    click: string
  }[] = [{
    title: 'add',
    class: 'btn btn-light',
    icon: 'fa fa-plus',
    click: `this.emitEvent('add', null)`
  }, {
    title: 'refresh',
    class: 'btn btn-light',
    icon: 'fa fa-refresh',
    click: `this.refresh()`
  }];

  // EXCEL
  @ViewChild(DatatableComponent, { static: false }) datatableComponent: DatatableComponent;

  constructor(
    public _service: TransactionTypeService,
    private _modalService: NgbModal,
    private _router: Router,
  ) { }

  public async emitEvent(event) {
    this.openModal(event.op, event.obj);
  };

  public async openModal(op: string, obj: any) {
    switch (op) {
      case 'view':
        this._router.navigateByUrl('transaction-types/view/' + obj._id);
        break;
      case 'add':
        this._router.navigateByUrl('transaction-types/add');
        break;
      case 'update':
        this._router.navigateByUrl('transaction-types/update/' + obj._id);
        break;
      case 'delete':
        this._router.navigateByUrl('transaction-types/delete/' + obj._id);
        break;
      default: ;
    }
  };

  public refresh() {
    this.datatableComponent.refresh();
  }
}