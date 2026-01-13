import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { IAttribute, IButton } from '@types';
import { DatatableModule } from 'app/components/datatable/datatable.module';
import { PaymentMethodService } from 'app/core/services/payment-method.service';

@Component({
  selector: 'app-list-payment-methods',
  templateUrl: './list-payment-method.component.html',
  standalone: true,
  imports: [CommonModule, TranslateModule, DatatableModule],
})
export class ListPaymentMethodComponent {
  public title: string = 'payment-methods';
  public loading: boolean = false;
  public sort = { name: 1 };
  public columns: IAttribute[] = [
    {
      name: 'code',
      visible: true,
      disabled: false,
      filter: true,
      datatype: 'number',
      project: null,
      align: 'left',
      required: false,
    },
    {
      name: 'name',
      visible: true,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: null,
      align: 'left',
      required: false,
    },
    {
      name: 'discount',
      visible: true,
      disabled: false,
      filter: true,
      datatype: 'number',
      project: null,
      align: 'left',
      required: false,
    },
    {
      name: 'surcharge',
      visible: true,
      disabled: false,
      filter: true,
      datatype: 'number',
      project: null,
      align: 'left',
      required: false,
    },

    {
      name: 'surchargeArticle.description',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: null,
      align: 'left',
      required: false,
    },
    {
      name: 'isCurrentAccount',
      visible: true,
      disabled: false,
      filter: true,
      datatype: 'boolean',
      project: null,
      align: 'left',
      required: false,
    },
    {
      name: 'acceptReturned',
      visible: true,
      disabled: false,
      filter: true,
      datatype: 'boolean',
      project: null,
      align: 'left',
      required: false,
    },
    {
      name: 'inputAndOuput',
      visible: true,
      disabled: false,
      filter: true,
      datatype: 'boolean',
      project: null,
      align: 'left',
      required: false,
    },
    {
      name: 'checkDetail',
      visible: true,
      disabled: false,
      filter: true,
      datatype: 'boolean',
      project: null,
      align: 'left',
      required: false,
    },
    {
      name: 'cardDetail',
      visible: true,
      disabled: false,
      filter: true,
      datatype: 'boolean',
      project: null,
      align: 'left',
      required: false,
    },
    {
      name: 'allowToFinance',
      visible: true,
      disabled: false,
      filter: true,
      datatype: 'boolean',
      project: null,
      align: 'left',
      required: false,
    },
    {
      name: 'cashBoxImpact',
      visible: true,
      disabled: false,
      filter: true,
      datatype: 'boolean',
      project: null,
      align: 'left',
      required: false,
    },
    {
      name: 'allowCurrencyValue',
      visible: true,
      disabled: false,
      filter: true,
      datatype: 'boolean',
      project: null,
      align: 'left',
      required: false,
    },
    {
      name: 'commission',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'number',
      project: null,
      align: 'left',
      required: false,
    },
    {
      name: 'commissionArticle.description',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: null,
      align: 'left',
      required: false,
    },
    {
      name: 'administrativeExpense',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'number',
      project: null,
      align: 'left',
      required: false,
    },
    {
      name: 'administrativeExpenseArticle.description',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: null,
      align: 'left',
      required: false,
    },
    {
      name: 'otherExpense',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'number',
      project: null,
      align: 'left',
      required: false,
    },
    {
      name: 'otherExpenseArticle.description',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: null,
      align: 'left',
      required: false,
    },
    {
      name: 'expirationDays',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'number',
      project: null,
      align: 'left',
      required: false,
    },
    {
      name: 'checkPerson',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'boolean',
      project: null,
      align: 'left',
      required: false,
    },
    {
      name: 'payFirstQuota',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'boolean',
      project: null,
      align: 'left',
      required: false,
    },
    {
      name: 'allowBank',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'boolean',
      project: null,
      align: 'left',
      required: false,
    },
    {
      name: 'account.description',
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
      project: `{ "$dateToString": { "date": "$creationDate", "format": "%d/%m/%Y %H:%M", "timezone": "-03:00" } }`,
      align: 'left',
      required: false,
    },
    {
      name: 'creationUser.name',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'string',
      align: 'left',
      required: false,
    },
    {
      name: 'updateUser.name',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'string',
      align: 'left',
      required: false,
    },
    {
      name: 'updateDate',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: `{ "$dateToString": { "date": "$updateDate", "format": "%d/%m/%Y %H:%M", "timezone": "-03:00" } }`,
      align: 'left',
      required: false,
    },
    {
      name: '_id',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: `{ "$toString": "$_id" }`,
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
      title: 'refresh',
      class: 'btn btn-light',
      icon: 'fa fa-refresh',
      click: `this.refresh()`,
    },
  ];

  constructor(public _service: PaymentMethodService, private _router: Router) {}

  public async emitEvent(event) {
    this.openModal(event.op, event.obj);
  }

  public async openModal(op: string, obj: any) {
    switch (op) {
      case 'view':
        this._router.navigateByUrl('entities/payment-methods/view/' + obj._id);
        break;
      case 'update':
        this._router.navigateByUrl('entities/payment-methods/update/' + obj._id);
        break;
      case 'delete':
        this._router.navigateByUrl('entities/payment-methods/delete/' + obj._id);
        break;
      case 'add':
        this._router.navigateByUrl('entities/payment-methods/add');
        break;
    }
  }
}
