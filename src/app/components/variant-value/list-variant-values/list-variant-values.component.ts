import { Component, ViewEncapsulation, ViewChild } from '@angular/core';
import { NgbAlertConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DatatableComponent } from '../../datatable/datatable.component';
import { Router } from '@angular/router';
import { IButton } from 'app/util/buttons.interface';
import { VariantValue } from '../variant-value';
import { VariantValueService } from '../variant-value.service';


@Component({
	selector: 'app-list-variant-values',
	templateUrl: './list-variant-values.component.html',
	styleUrls: ['./list-variant-values.component.scss'],
	encapsulation: ViewEncapsulation.None
})

export class ListVariantValuesComponent {

    public title: string = 'variant-values';
    public sort = { "description": 1 };
    public columns = VariantValue.getAttributes();
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
      public _service: VariantValueService,
      private _modalService: NgbModal,
      private _router: Router,
    ) { }
  
    public async emitEvent(event) {
      this.openModal(event.op, event.obj);
    };
  
    public async openModal(op: string, obj: any) {
      switch (op) {
        case 'view':
          this._router.navigateByUrl('variant-values/view/' + obj._id);
          break;
        case 'add':
          this._router.navigateByUrl('variant-values/add');
          break;
        case 'update':
          this._router.navigateByUrl('variant-values/update/' + obj._id);
          break;
        case 'delete':
          this._router.navigateByUrl('variant-values/delete/' + obj._id);
          break;
        default: ;
      }
    };
  
    public refresh() {
      this.datatableComponent.refresh();
    }
}
