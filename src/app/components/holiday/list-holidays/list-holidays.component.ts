import { Component, ViewEncapsulation, ViewChild } from '@angular/core';
import { Holiday } from '../holiday.model';
import { HolidayService } from '../holiday.service';
import { HolidayComponent } from '../crud/holiday.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DatatableComponent } from '../../datatable/datatable.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-list-holidays',
  templateUrl: './list-holidays.component.html',
  styleUrls: ['./list-holidays.component.scss'],
  encapsulation: ViewEncapsulation.None
})

export class ListHolidaysComponent {

  public title: string = 'holidays';
  public sort = { "name": 1 };
  public columns = Holiday.getAttributes();
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
    public _service: HolidayService,
    private _modalService: NgbModal,
    private _router: Router,
  ) { }

  public async emitEvent(event) {
    this.openModal(event.op, event.obj);
  };

  public async openModal(op: string, obj: any) {
    switch (op) {
      case 'view':
        this._router.navigateByUrl('holidays/view/' + obj._id);
        break;
      case 'add':
        this._router.navigateByUrl('holidays/add');
        break;
      case 'update':
        this._router.navigateByUrl('holidays/update/' + obj._id);
        break;
      case 'delete':
        this._router.navigateByUrl('holidays/delete/' + obj._id);
        break;
      default: ;
    }
  };

  public refresh() {
    this.datatableComponent.refresh();
  }
}
