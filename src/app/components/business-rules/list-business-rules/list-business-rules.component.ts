import {Component, ViewEncapsulation, ViewChild} from '@angular/core';
import {Router} from '@angular/router';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {IButton} from 'app/util/buttons.interface';

import {DatatableComponent} from '../../datatable/datatable.component';
import {BusinessRuleService} from '../business-rule.service';
import {BusinessRule} from '../business-rules';

@Component({
  selector: 'app-list-business-rules',
  templateUrl: './list-business-rules.component.html',
  styleUrls: ['./list-business-rules.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ListBusinessRulesComponent {
  public title: string = 'business-rules';
  public sort = {code: 1};
  public columns = BusinessRule.getAttributes();
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
      title: 'refresh',
      class: 'btn btn-light',
      icon: 'fa fa-refresh',
      click: `this.refresh()`,
    },
  ];

  // EXCEL
  @ViewChild(DatatableComponent) datatableComponent: DatatableComponent;

  constructor(
    public _service: BusinessRuleService,
    private _modalService: NgbModal,
    private _router: Router,
  ) {}

  public async emitEvent(event) {
    this.openModal(event.op, event.obj);
  }

  public async openModal(op: string, obj: any) {
    switch (op) {
      case 'view':
        this._router.navigateByUrl('business-rule/view/' + obj._id);
        break;
      case 'add':
        this._router.navigateByUrl('business-rule/add');
        break;
      case 'update':
        this._router.navigateByUrl('business-rule/update/' + obj._id);
        break;
      case 'delete':
        this._router.navigateByUrl('business-rule/delete/' + obj._id);
        break;
      default:
    }
  }

  public refresh() {
    this.datatableComponent.refresh();
  }
}
