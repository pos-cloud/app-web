import { Component, ViewEncapsulation, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DatatableComponent } from '../../datatable/datatable.component';
import { Router } from '@angular/router';
import { IButton } from 'app/util/buttons.interface';
import { CompanyNew } from '../company-new';
import { CompanyNewService } from '../company-new.service';

@Component({
  selector: 'app-list-company-news',
  templateUrl: './list-company-news.component.html',
  styleUrls: ['./list-company-news.component.scss'],
  encapsulation: ViewEncapsulation.None
})

export class ListCompanyNewsComponent {

  public title: string = 'company-news';
  public sort = { "name": 1 };
  public columns = CompanyNew.getAttributes();
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
    public _service: CompanyNewService,
    private _modalService: NgbModal,
    private _router: Router,
  ) { }

  public async emitEvent(event) {
    this.openModal(event.op, event.obj);
  };

  public async openModal(op: string, obj: any) {
    switch (op) {
      case 'view':
        this._router.navigateByUrl('applications/view/' + obj._id);
        break;
      case 'add':
        this._router.navigateByUrl('applications/add');
        break;
      case 'update':
        this._router.navigateByUrl('applications/update/' + obj._id);
        break;
      case 'delete':
        this._router.navigateByUrl('applications/delete/' + obj._id);
        break;
      default: ;
    }
  };

  public refresh() {
    this.datatableComponent.refresh();
  }
}
