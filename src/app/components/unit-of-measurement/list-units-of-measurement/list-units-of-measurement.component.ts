import { Component, ViewEncapsulation, ViewChild } from '@angular/core';
import { UnitOfMeasurement } from '../unit-of-measurement.model';
import { UnitOfMeasurementService } from '../unit-of-measurement.service';
import { UnitOfMeasurementComponent } from '../crud/unit-of-measurement.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DatatableComponent } from '../../datatable/datatable.component';
import { IButton } from 'app/util/buttons.interface';

@Component({
  selector: 'app-list-units-of-measurement',
  templateUrl: './list-units-of-measurement.component.html',
  styleUrls: ['./list-units-of-measurement.component.scss'],
  encapsulation: ViewEncapsulation.None
})

export class ListUnitOfMeasurementsComponent {

  public title: string = 'units-of-measurement';
  public sort = { "name": 1 };
  public columns = UnitOfMeasurement.getAttributes();
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
  @ViewChild(DatatableComponent) datatableComponent: DatatableComponent;

  constructor(
    public _service: UnitOfMeasurementService,
    private _modalService: NgbModal,
  ) { }

  public async emitEvent(event) {
    this.openModal(event.op, event.obj);
  };

  public async openModal(op: string, obj: any) {

    let modalRef;
    let scrollX = await window.scrollX;
    let scrollY = await window.scrollY;
    switch (op) {
      case 'view':
        modalRef = this._modalService.open(UnitOfMeasurementComponent, { size: 'lg', backdrop: 'static' });
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
        modalRef = this._modalService.open(UnitOfMeasurementComponent, { size: 'lg', backdrop: 'static' });
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
        modalRef = this._modalService.open(UnitOfMeasurementComponent, { size: 'lg', backdrop: 'static' });
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
        modalRef = this._modalService.open(UnitOfMeasurementComponent, { size: 'lg', backdrop: 'static' })
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
