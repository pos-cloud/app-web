import { Component, ViewChild, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { IButton } from '@types';
import { CategoryService } from '../../../core/services/category.service';
import { DatatableComponent } from '../../datatable/datatable.component';
import { Category } from '../category';

@Component({
  selector: 'app-list-categories',
  templateUrl: './list-categories.component.html',
  styleUrls: ['./list-categories.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ListCategoriesComponent {
  public title: string = 'categories';
  public sort = { description: 1 };
  public columns = Category.getAttributes();
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
