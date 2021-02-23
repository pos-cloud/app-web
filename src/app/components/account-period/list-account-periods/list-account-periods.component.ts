import { Component, ViewEncapsulation, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DatatableComponent } from '../../datatable/datatable.component';
import { Router } from '@angular/router';
import { IButton } from 'app/util/buttons.interface';
import { AccountPeriod } from '../account-period';
import { AccountPeriodService } from '../account-period.service';

@Component({
  selector: 'app-list-account-periods',
  templateUrl: './list-account-periods.component.html',
  styleUrls: ['./list-account-periods.component.scss'],
  encapsulation: ViewEncapsulation.None
})

export class ListAccountPeriodsComponent {

  public title: string = 'account-period';
  public sort = { "status": 1 };
  public columns = AccountPeriod.getAttributes();
  public rowButtons: IButton[] = [{
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
  public headerButtons: IButton[] = [{
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
    public _service: AccountPeriodService,
    private _modalService: NgbModal,
    private _router: Router,
  ) { }

  public async emitEvent(event) {
    this.openModal(event.op, event.obj);
  };

  public async openModal(op: string, obj: any) {
    switch (op) {
      case 'view':
        this._router.navigateByUrl('account-periods/view/' + obj._id);
        break;
      case 'add':
        this._router.navigateByUrl('account-periods/add');
        break;
      case 'update':
        this._router.navigateByUrl('account-periods/update/' + obj._id);
        break;
      case 'delete':
        this._router.navigateByUrl('account-periods/delete/' + obj._id);
        break;
      default: ;
    }
  };

  public refresh() {
    this.datatableComponent.refresh();
  }
}