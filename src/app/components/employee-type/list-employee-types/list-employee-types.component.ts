import { Component, ViewEncapsulation, ViewChild } from '@angular/core';
import { EmployeeType } from '../employee-type.model';
import { EmployeeTypeService } from '../employee-type.service';
import { EmployeeTypeComponent } from '../crud/employee-type.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DatatableComponent } from '../../datatable/datatable.component';

@Component({
  selector: 'app-list-employee-types',
  templateUrl: './list-employee-types.component.html',
  styleUrls: ['./list-employee-types.component.scss'],
  encapsulation: ViewEncapsulation.None
})

export class ListEmployeeTypesComponent {

  public title: string = 'employee-types';
  public sort = { "name": 1 };
  public columns = EmployeeType.getAttributes();
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
    public _service: EmployeeTypeService,
    private _modalService: NgbModal,
  ) {}

  public async emitEvent(event) {
    this.openModal(event.op, event.obj);
  };

  public async openModal(op: string, obj: any) {

    let modalRef;
    let scrollX = await window.scrollX;
    let scrollY = await window.scrollY;
    switch (op) {
      case 'view':
        modalRef = this._modalService.open(EmployeeTypeComponent, { size: 'lg', backdrop: 'static' });
        modalRef.componentInstance.objId = obj._id;
        modalRef.componentInstance.readonly = true;
        modalRef.componentInstance.operation = 'view';
        modalRef.result.then((result) => {
          window.scrollTo(scrollX, scrollY);
        }, (reason) => {
          window.scrollTo(scrollX, scrollY);
        });
        break;
      case 'add':
        modalRef = this._modalService.open(EmployeeTypeComponent, { size: 'lg', backdrop: 'static' });
        modalRef.componentInstance.readonly = false;
        modalRef.componentInstance.operation = 'add';
        modalRef.result.then((result) => {
          if (result.obj) this.refresh();
          window.scrollTo(scrollX, scrollY);
        }, (reason) => {
          window.scrollTo(scrollX, scrollY);
        });
        break;
      case 'update':
        modalRef = this._modalService.open(EmployeeTypeComponent, { size: 'lg', backdrop: 'static' });
        modalRef.componentInstance.objId = obj._id;
        modalRef.componentInstance.readonly = false;
        modalRef.componentInstance.operation = 'update';
        modalRef.result.then((result) => {
          if (result.obj) this.refresh();
          window.scrollTo(scrollX, scrollY);
        }, (reason) => {
          window.scrollTo(scrollX, scrollY);
        });
        break;
      case 'delete':
        modalRef = this._modalService.open(EmployeeTypeComponent, { size: 'lg', backdrop: 'static' })
        modalRef.componentInstance.objId = obj._id;
        modalRef.componentInstance.readonly = true;
        modalRef.componentInstance.operation = 'delete';
        modalRef.result.then((result) => {
          if (result.obj) this.refresh();
          window.scrollTo(scrollX, scrollY);
        }, (reason) => {
          window.scrollTo(scrollX, scrollY);
        });
        break;
      default: ;
    }
  };

  public refresh() {
    this.datatableComponent.refresh();
  }
}
