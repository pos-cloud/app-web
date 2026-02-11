import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { TransactionTypeService } from '@core/services/transaction-type.service';
import { NgbAlertConfig } from '@ng-bootstrap/ng-bootstrap';
import { IAttribute, IButton } from '@types';
import { DatatableComponent } from 'app/components/datatable/datatable.component';
import { DatatableModule } from 'app/components/datatable/datatable.module';

@Component({
  selector: 'app-list-transaction-type',
  templateUrl: './list-transaction-type.component.html',
  standalone: true,
  imports: [DatatableModule],
})
export class ListTransactionTypeComponent {
  public loading: boolean = false;
  public title: string = 'transaction-types';
  public sort = { name: 1 };
  public columns: IAttribute[] = [
    {
      name: 'transactionMovement',
      visible: true,
      filter: true,
      datatype: 'string',
      align: 'left',
    },
    {
      name: 'name',
      visible: true,
      filter: true,
      datatype: 'string',
      align: 'left',
    },
    {
      name: 'order',
      filter: true,
      datatype: 'number',
      align: 'left',
    },
    {
      name: 'branch.name',
      filter: true,
      datatype: 'string',
      align: 'left',
    },
    {
      name: 'movement',
      filter: true,
      datatype: 'string',
      align: 'left',
    },
    {
      name: 'abbreviation',
      filter: true,
      datatype: 'string',
      align: 'left',
    },
    {
      name: 'labelPrint',
      filter: true,
      datatype: 'string',
      align: 'left',
    },
    {
      name: 'modifyStock',
      filter: true,
      datatype: 'boolean',
      align: 'left',
    },
    {
      name: 'currentAccount',
      filter: true,
      datatype: 'string',
      align: 'left',
    },
    {
      name: 'stockMovement',
      filter: true,
      datatype: 'string',
      align: 'left',
    },
    {
      name: 'requestArticles',
      filter: true,
      datatype: 'boolean',
      align: 'left',
    },
    {
      name: 'modifyArticle',
      filter: true,
      datatype: 'boolean',
      align: 'left',
    },
    {
      name: 'entryAmount',
      filter: true,
      datatype: 'string',
      align: 'left',
    },
    {
      name: 'requestTaxes',
      filter: true,
      datatype: 'boolean',
      align: 'left',
    },
    {
      name: 'requestPaymentMethods',
      filter: true,
      datatype: 'boolean',
      align: 'left',
    },
    {
      name: 'showKeyboard',
      filter: true,
      datatype: 'boolean',
      align: 'left',
    },
    {
      name: 'defectOrders',
      filter: true,
      datatype: 'boolean',
      align: 'left',
    },
    {
      name: 'electronics',
      filter: true,
      datatype: 'boolean',
      align: 'left',
    },
    {
      name: 'codes',
      filter: true,
      datatype: 'string',
      project: `{"$reduce":{"input":"$codes.code","initialValue":"","in":{"$concat":["$$value",{"$cond":{"if":{"$eq":["$$value",""]},"then":"","else":"; "}},{"$concat":[{"$toString":"$$this"}]}]}}}`,
      align: 'left',
    },
    {
      name: 'fiscalCode',
      filter: true,
      datatype: 'string',
      align: 'left',
    },
    {
      name: 'fixedOrigin',
      filter: true,
      datatype: 'number',
      align: 'left',
    },
    {
      name: 'fixedLetter',
      filter: true,
      datatype: 'string',
      align: 'left',
    },
    {
      name: 'maxOrderNumber',
      filter: true,
      datatype: 'number',
      align: 'left',
    },
    {
      name: 'showPrices',
      filter: true,
      datatype: 'boolean',
      align: 'left',
    },
    {
      name: 'printable',
      filter: true,
      datatype: 'boolean',
      align: 'left',
    },
    {
      name: 'defectPrinter.name',
      filter: true,
      datatype: 'string',
      align: 'left',
    },
    {
      name: 'defectUseOfCFDI.name',
      filter: true,
      datatype: 'string',
      align: 'left',
    },
    {
      name: 'tax',
      filter: true,
      datatype: 'boolean',
      align: 'left',
    },
    {
      name: 'cashBoxImpact',
      filter: true,
      datatype: 'boolean',
      align: 'left',
    },
    {
      name: 'cashOpening',
      filter: true,
      datatype: 'boolean',
      align: 'left',
    },
    {
      name: 'cashClosing',
      filter: true,
      datatype: 'boolean',
      align: 'left',
    },
    {
      name: 'allowAPP',
      filter: true,
      datatype: 'boolean',
      align: 'left',
    },
    {
      name: 'allowTransactionClose',
      filter: true,
      datatype: 'boolean',
      align: 'left',
    },
    {
      name: 'allowEdit',
      filter: true,
      datatype: 'boolean',
      align: 'left',
    },
    {
      name: 'allowDelete',
      filter: true,
      datatype: 'boolean',
      align: 'left',
    },
    {
      name: 'allowZero',
      filter: true,
      datatype: 'boolean',
      align: 'left',
    },
    {
      name: 'allowCompanyDiscount',
      filter: true,
      datatype: 'boolean',
      align: 'left',
    },
    {
      name: 'requestCurrency',
      filter: true,
      datatype: 'string',
      align: 'left',
    },
    {
      name: 'requestEmployee.name',
      filter: true,
      datatype: 'string',
      align: 'left',
    },
    {
      name: 'requestTransport',
      filter: true,
      datatype: 'boolean',
      align: 'left',
    },
    {
      name: 'fastPayment.name',
      filter: true,
      datatype: 'string',
      align: 'left',
    },
    {
      name: 'requestCompany',
      filter: true,
      datatype: 'string',
      align: 'left',
    },
    {
      name: 'isPreprinted',
      filter: true,
      datatype: 'boolean',
      align: 'left',
    },
    {
      name: 'automaticNumbering',
      filter: true,
      datatype: 'boolean',
      align: 'left',
    },
    {
      name: 'automaticCreation',
      filter: true,
      datatype: 'boolean',
      align: 'left',
    },
    {
      name: 'showPriceType',
      filter: true,
      datatype: 'string',
      align: 'left',
    },
    {
      name: 'showDescriptionType',
      filter: true,
      datatype: 'string',
      align: 'left',
    },
    {
      name: 'printDescriptionType',
      filter: true,
      datatype: 'string',
      align: 'left',
    },
    {
      name: 'printSign',
      filter: true,
      datatype: 'boolean',
      align: 'left',
    },
    {
      name: 'posKitchen',
      filter: true,
      datatype: 'boolean',
      align: 'left',
    },
    {
      name: 'readLayout',
      filter: true,
      datatype: 'boolean',
      align: 'left',
    },
    {
      name: 'updatePrice',
      filter: true,
      datatype: 'boolean',
      align: 'left',
    },
    {
      name: 'resetNumber',
      filter: true,
      datatype: 'boolean',
      align: 'left',
    },
    {
      name: 'updateArticle',
      filter: true,
      datatype: 'boolean',
      align: 'left',
    },
    {
      name: 'finishCharge',
      filter: true,
      datatype: 'boolean',
      align: 'left',
    },
    {
      name: 'requestShipmentMethod',
      filter: true,
      datatype: 'boolean',
      align: 'left',
    },
    {
      name: 'defectShipmentMethod.name',
      filter: true,
      datatype: 'string',
      align: 'left',
    },
    {
      name: 'requestEmailTemplate',
      filter: true,
      datatype: 'boolean',
      align: 'left',
    },
    {
      name: 'defectEmailTemplate.name',
      filter: true,
      datatype: 'string',
      align: 'left',
    },
    {
      name: 'application.name',
      filter: true,
      datatype: 'string',
      align: 'left',
    },
    {
      name: 'company.name',
      filter: true,
      datatype: 'string',
      align: 'left',
    },
    {
      name: 'optionalAFIP',
      filter: true,
      datatype: 'string',
      align: 'left',
    },
    {
      name: 'level',
      filter: true,
      datatype: 'number',
      align: 'left',
    },
    {
      name: 'groupsArticles',
      filter: true,
      datatype: 'boolean',
      align: 'left',
    },
    {
      name: 'printOrigin',
      filter: true,
      datatype: 'boolean',
      align: 'left',
    },
    {
      name: 'expirationDate',
      filter: true,
      datatype: 'date',
      align: 'left',
    },
    {
      name: 'numberPrint',
      filter: true,
      datatype: 'number',
      align: 'left',
    },
    {
      name: 'finishState',
      filter: true,
      datatype: 'string',
      align: 'left',
    },
    {
      name: 'allowAccounting',
      visible: false,
      disabled: true,
      filter: false,
      datatype: 'string',
      align: 'left',
      project: null,
      required: true,
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
  public rowButtons: IButton[] = [
    {
      title: 'view',
      class: 'btn btn-success btn-sm',
      icon: 'fa fa-eye',
      click: `this.emitEvent('view', item, null)`,
    },
    {
      title: 'update',
      class: 'btn btn-primary btn-sm',
      icon: 'fa fa-pencil',
      click: `this.emitEvent('update', item, null)`,
    },
    {
      title: 'delete',
      class: 'btn btn-danger btn-sm',
      icon: 'fa fa-trash-o',
      click: `this.emitEvent('delete', item, null)`,
    },
  ];

  @ViewChild(DatatableComponent) datatableComponent: DatatableComponent;

  constructor(
    public _service: TransactionTypeService,
    private _router: Router,
    public _alertConfig: NgbAlertConfig
  ) {}

  public async emitEvent(event) {
    this.redirect(event.op, event.obj);
  }

  public async redirect(op: string, obj: any) {
    switch (op) {
      case 'view':
        this._router.navigateByUrl('entities/transaction-types/view/' + obj._id);
        break;
      case 'update':
        this._router.navigateByUrl('entities/transaction-types/update/' + obj._id);
        break;
      case 'delete':
        this._router.navigateByUrl('entities/transaction-types/delete/' + obj._id);
        break;
      case 'add':
        this._router.navigateByUrl('entities/transaction-types/add');
        break;
    }
  }

  public refresh() {
    this.datatableComponent.refresh();
  }
}
