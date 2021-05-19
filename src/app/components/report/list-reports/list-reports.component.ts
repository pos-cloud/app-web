import { Component, ViewEncapsulation, ViewChild } from '@angular/core';
import { Report } from '../report.model';
import { ReportService } from '../report.service';
import { DatatableComponent } from '../../datatable/datatable.component';
import { Router } from '@angular/router';
import { IButton } from 'app/util/buttons.interface';

@Component({
  selector: 'app-list-reports',
  templateUrl: './list-reports.component.html',
  styleUrls: ['./list-reports.component.scss'],
  encapsulation: ViewEncapsulation.None
})

export class ListReportsComponent {

  public title: string = 'reports';
  public sort = { "name": 1 };
  public columns = Report.getAttributes();
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
    public _service: ReportService,
    private _router: Router,
  ) { }

  public async emitEvent(event) {
    this.openModal(event.op, event.obj);
  };

  public async openModal(op: string, obj: any) {
    switch (op) {
      case 'view':
        this._router.navigateByUrl('reports/view/' + obj._id);
        break;
      case 'add':
        this._router.navigateByUrl('reports/add');
        break;
      case 'update':
        this._router.navigateByUrl('reports/update/' + obj._id);
        break;
      case 'delete':
        this._router.navigateByUrl('reports/delete/' + obj._id);
        break;
      default: ;
    }
  };

  public refresh() {
    this.datatableComponent.refresh();
  }
}
