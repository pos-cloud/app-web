import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { IButton } from '@types';
import { CategoryService } from '../../../core/services/category.service';
import { DatatableComponent } from '../../datatable/datatable.component';

@Component({
  selector: 'app-list-categories',
  templateUrl: './list-categories.component.html',
})
export class ListCategoriesComponent {
  public title: string = 'categories';
  public sort = { description: 1 };
  public columns = [
    {
      name: 'order',
      visible: true,
      disabled: false,
      filter: true,
      datatype: 'number',
      project: null,
      align: 'center',
      required: false,
    },
    {
      name: 'description',
      visible: true,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: null,
      align: 'left',
      required: false,
    },
    {
      name: '_parent.name',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: '"$parent.description"',
      align: 'left',
      required: false,
    },
    {
      name: 'picture',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: null,
      align: 'left',
      required: false,
    },
    {
      name: 'visibleInvoice',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'boolean',
      project: null,
      align: 'left',
      required: false,
    },
    {
      name: 'visibleOnSale',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'boolean',
      project: null,
      align: 'left',
      required: false,
    },
    {
      name: 'visibleOnPurchase',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'boolean',
      project: null,
      align: 'left',
      required: false,
    },
    {
      name: 'ecommerceEnabled',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'boolean',
      project: null,
      align: 'left',
      required: false,
    },
    {
      name: 'favourite',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'boolean',
      project: null,
      align: 'left',
      required: false,
    },
    {
      name: 'isRequiredOptional',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'boolean',
      project: null,
      align: 'left',
      required: false,
    },
    {
      name: 'wooId',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: null,
      align: 'left',
      required: false,
    },
    {
      name: 'tiendaNubeId',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: null,
      align: 'left',
      required: false,
    },
    {
      name: 'creationDate',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'date',
      project: null,
      align: 'left',
      required: false,
    },
    {
      name: 'operationType',
      visible: false,
      disabled: true,
      filter: false,
      datatype: 'string',
      defaultFilter: `{ "$ne": "D" }`,
      project: null,
      align: 'left',
      required: true,
    },
  ];
  public rowButtons: IButton[] = [
    {
      title: 'view',
      class: 'btn btn-success btn-sm',
      icon: 'fa fa-eye',
      click: `this.emitEvent('view', item)`,
    },
    {
      title: 'update',
      class: 'btn btn-primary btn-sm',
      icon: 'fa fa-pencil',
      click: `this.emitEvent('update', item)`,
    },
    {
      title: 'delete',
      class: 'btn btn-danger btn-sm',
      icon: 'fa fa-trash-o',
      click: `this.emitEvent('delete', item)`,
    },
  ];
  public headerButtons: IButton[] = [
    {
      title: 'add',
      class: 'btn btn-light',
      icon: 'fa fa-plus',
      click: `this.emitEvent('add', null)`,
    },
    {
      title: 'import',
      class: 'btn btn-light',
      icon: 'fa fa-upload',
      click: `this.emitEvent('import', null)`,
    },
  ];

  // EXCEL
  @ViewChild(DatatableComponent) datatableComponent: DatatableComponent;

  constructor(
    public _service: CategoryService,
    private _modalService: NgbModal,
    private _router: Router
  ) {}

  public async emitEvent(event) {
    this.openModal(event.op, event.obj);
  }

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
      default:
    }
  }

  public refresh() {
    this.datatableComponent.refresh();
  }
}
