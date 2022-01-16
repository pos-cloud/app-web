import { Component, OnInit, Output, EventEmitter, ViewEncapsulation, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

import { NgbModal, NgbAlertConfig } from '@ng-bootstrap/ng-bootstrap';
import { DatatableComponent } from 'app/components/datatable/datatable.component';
import { IButton } from 'app/util/buttons.interface';

import { CompanyGroup } from "../company-group";

import { CompanyGroupService } from "../company-group.service";

import { CompanyGroupComponent } from "../crud/company-group.component";

@Component({
    selector: 'app-list-companies-group',
    templateUrl: './list-companies-group.component.html',
    styleUrls: ['./list-companies-group.component.scss'],
    providers: [NgbAlertConfig],
    encapsulation: ViewEncapsulation.None
})
export class ListCompaniesGroupComponent {

    public title: string = 'company-groups';
    public sort = { "name": 1 };
    public columns = CompanyGroup.getAttributes();
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
      public _service: CompanyGroupService,
      private _modalService: NgbModal,
      private _router: Router,
    ) { }
  
    public async emitEvent(event) {
      this.openModal(event.op, event.obj);
    };
  
    public async openModal(op: string, obj: any) {
      switch (op) {
        case 'view':
          this._router.navigateByUrl('company-groups/view/' + obj._id);
          break;
        case 'add':
          this._router.navigateByUrl('company-groups/add');
          break;
        case 'update':
          this._router.navigateByUrl('company-groups/update/' + obj._id);
          break;
        case 'delete':
          this._router.navigateByUrl('company-groups/delete/' + obj._id);
          break;
        default: ;
      }
    };
  
    public refresh() {
      this.datatableComponent.refresh();
    }
  }
  