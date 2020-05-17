import { Component, ViewEncapsulation, ViewChild } from '@angular/core';
import { ApplicationService } from '../application.service';
import { ApplicationComponent } from '../crud/application.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DatatableComponent } from '../../datatable/datatable.component';
import { Application } from '../application.model';

@Component({
  selector: 'app-list-applications',
  templateUrl: './list-applications.component.html',
  styleUrls: ['./list-applications.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [ApplicationService]
})

export class ListApplicationsComponent {

  public title: string = 'applications';
  public sort = { "name": 1 };
  public columns = Application.getAttributes();

  // //EXCEL
  @ViewChild(DatatableComponent, { static: false }) datatableComponent: DatatableComponent;

  constructor(
    public _service: ApplicationService,
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
        modalRef = this._modalService.open(ApplicationComponent, { size: 'lg', backdrop: 'static' });
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
        modalRef = this._modalService.open(ApplicationComponent, { size: 'lg', backdrop: 'static' });
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
        modalRef = this._modalService.open(ApplicationComponent, { size: 'lg', backdrop: 'static' });
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
        modalRef = this._modalService.open(ApplicationComponent, { size: 'lg', backdrop: 'static' })
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
