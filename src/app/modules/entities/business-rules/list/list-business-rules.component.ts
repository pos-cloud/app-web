import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ApiResponse, IAttribute, IButton, PrintType } from '@types';

import { PrintService } from '@core/services/print.service';
import { ToastService } from '@shared/components/toast/toast.service';
import { DatatableModule } from 'app/components/datatable/datatable.module';
import * as printJS from 'print-js';
import { Subject, takeUntil } from 'rxjs';
import { DatatableComponent } from '../../../../components/datatable/datatable.component';
import { BusinessRuleService } from '../../../../core/services/business-rule.service';

@Component({
  selector: 'app-list-business-rules',
  templateUrl: './list-business-rules.component.html',
  standalone: true,
  imports: [DatatableModule],
})
export class ListBusinessRulesComponent {
  public title: string = 'business-rules';
  public loading: boolean = false;
  public sort = { name: 1 };
  private destroy$ = new Subject<void>();

  public columns: IAttribute[] = [
    {
      name: 'code',
      visible: true,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: null,
      align: 'left',
      required: true,
    },
    {
      name: 'name',
      visible: true,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: null,
      align: 'left',
      required: true,
    },
    {
      name: 'startDate',
      visible: true,
      disabled: false,
      filter: true,
      datatype: 'date',
      project: `{ "$dateToString": { "date": "$startDate", "format": "%d/%m/%Y", "timezone": "-03:00" } }`,
      align: 'left',
      required: false,
    },
    {
      name: 'endDate',
      visible: true,
      disabled: false,
      filter: true,
      datatype: 'date',
      project: `{ "$dateToString": { "date": "$endDate", "format": "%d/%m/%Y", "timezone": "-03:00" } }`,
      align: 'left',
      required: false,
    },
    {
      name: 'totalStock',
      visible: true,
      disabled: false,
      filter: true,
      datatype: 'number',
      project: null,
      align: 'right',
      required: false,
    },
    {
      name: 'currentStock',
      visible: true,
      disabled: false,
      filter: true,
      datatype: 'number',
      project: null,
      align: 'right',
      required: false,
    },
    {
      name: 'active',
      visible: true,
      disabled: false,
      filter: true,
      datatype: 'boolean',
      project: null,
      align: 'center',
      required: false,
    },
    {
      name: 'discountType',
      visible: true,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: null,
      align: 'left',
      required: false,
    },
    {
      name: 'discountValue',
      visible: true,
      disabled: false,
      filter: true,
      datatype: 'number',
      project: null,
      align: 'right',
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
      name: 'updateDate',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'date',
      project: `{ "$dateToString": { "date": "$updateDate", "format": "%d/%m/%Y %H:%M", "timezone": "-03:00" } }`,
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
  rowButtons: IButton[] = [
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
    {
      title: 'print',
      class: 'btn btn-light btn-sm',
      icon: 'fa fa-print',
      click: `this.emitEvent('print', item)`,
    },
  ];
  headerButtons: IButton[] = [
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
    public _printService: PrintService,
    private _router: Router,
    public _service: BusinessRuleService,
    private _toastService: ToastService
  ) {}

  public async emitEvent(event) {
    this.openModal(event.op, event.obj);
  }

  public async openModal(op: string, obj: any) {
    switch (op) {
      case 'view':
        this._router.navigateByUrl('entities/business-rules/view/' + obj._id);
        break;
      case 'add':
        this._router.navigateByUrl('entities/business-rules/add');
        break;
      case 'update':
        this._router.navigateByUrl('entities/business-rules/update/' + obj._id);
        break;
      case 'delete':
        this._router.navigateByUrl('entities/business-rules/delete/' + obj._id);
        break;
      case 'print':
        const datalabel = {
          quantity: 1,
          ruleId: obj._id,
        };
        this.toPrint(PrintType.Rule, datalabel);
        this.loading = false;
        break;
      default:
    }
  }

  public refresh() {
    this.datatableComponent.refresh();
  }

  public toPrint(type: PrintType, data: {}): void {
    this.loading = true;

    this._printService
      .toPrint(type, data)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: Blob | ApiResponse) => {
          if (!result) {
            this._toastService.showToast({ message: 'Error al generar el PDF' });
            return;
          }
          if (result instanceof Blob) {
            try {
              const blobUrl = URL.createObjectURL(result);
              printJS(blobUrl);
            } catch (e) {
              this._toastService.showToast({ message: 'Error al generar el PDF' });
            }
          } else {
            this._toastService.showToast(result);
          }
        },
        error: (error) => {
          this._toastService.showToast({ message: 'Error al generar el PDF' });
        },
        complete: () => {
          this.loading = false;
        },
      });
  }
}
