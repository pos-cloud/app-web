import { Component, ViewEncapsulation, ViewChild } from '@angular/core';
import { NgbAlertConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DatatableComponent } from '../../datatable/datatable.component';
import { Router } from '@angular/router';
import { IButton } from 'app/util/buttons.interface';
import { Category } from '../category';
import { CategoryService } from '../category.service';
import { ImportComponent } from 'app/components/import/import.component';


@Component({
  selector: 'app-list-categories',
  templateUrl: './list-categories.component.html',
  styleUrls: ['./list-categories.component.scss'],
  encapsulation: ViewEncapsulation.None
})

export class ListCategoriesComponent {

  public title: string = 'categories';
  public sort = { "description": 1 };
  public columns = Category.getAttributes();
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
  }, {
    title: 'import',
    class: 'btn btn-light',
    icon: 'fa fa-upload',
    click: `this.emitEvent('import', null)`
  }];

  // EXCEL
  @ViewChild(DatatableComponent, { static: false }) datatableComponent: DatatableComponent;

  constructor(
    public _service: CategoryService,
    private _modalService: NgbModal,
    private _router: Router,
  ) { }

  public async emitEvent(event) {
    this.openModal(event.op, event.obj);
  };

  public async openModal(op: string, obj: any) {
    switch (op) {
      case 'view':
        this._router.navigateByUrl('categories/view/' + obj._id);
        break;
      case 'add':
        this._router.navigateByUrl('categories/add');
        break;
      case 'update':
        this._router.navigateByUrl('categories/update/' + obj._id);
        break;
      case 'delete':
        this._router.navigateByUrl('categories/delete/' + obj._id);
        break;
      case 'import':
        let modalRef;
        modalRef = this._modalService.open(ImportComponent, { size: 'lg', backdrop: 'static' });
        let model: any = new Category();
        model.model = "category";
        model.primaryKey = "description";
        model.order = '';
        model.picture = '';
        model.visibleInvoice = '';
        model.visibleOnSale = '';
        model.visibleOnPurchase = '';
        model.ecommerceEnabled = '';
        model.applications = '';
        model.favourite = '';
        model.isRequiredOptional = '';
        model.wooId = '';
        model.relations = new Array();
        model.relations.push("parent_relation_description_category");
        modalRef.componentInstance.model = model;
        modalRef.result.then((result) => {
          if (result === 'import_close') {
            this.refresh();
          }
        }, (reason) => {

        });
        break;
      default: ;
    }
  };

  public refresh() {
    this.datatableComponent.refresh();
  }
}
