import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { CashBoxService } from '@core/services/cash-box.service';
import { PrintService } from '@core/services/print.service';
import { ToastService } from '@shared/components/toast/toast.service';
import { ApiResponse, IAttribute, IButton, PrintType } from '@types';
import { DatatableComponent } from 'app/components/datatable/datatable.component';
import { DatatableModule } from 'app/components/datatable/datatable.module';
import * as printJS from 'print-js';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-list-cash-box',
  templateUrl: './list-cash-box.component.html',
  standalone: true,
  imports: [DatatableModule],
})
export class ListCashBoxComponent {
  public title: string = 'list-cash-boxs';
  public sort = { state: 1 };
  public loading: boolean = false;
  public columns: IAttribute[] = [
    {
      name: '_id',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: null,
      align: 'left',
      required: true,
    },
    {
      name: 'number',
      visible: true,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: null,
      align: 'left',
      required: true,
    },
    {
      name: 'day',
      visible: true,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: `{
        "$let": {
          "vars": {
            "dateStr": { "$dateToString": { "date": "$openingDate", "format": "%Y-%m-%d", "timezone": "-03:00" } },
            "dateOnly": { "$dateFromString": { "dateString": { "$concat": [{ "$dateToString": { "date": "$openingDate", "format": "%Y-%m-%d", "timezone": "-03:00" } }, "T12:00:00-03:00"] } } }
          },
          "in": {
            "$switch": {
              "branches": [
                { "case": { "$eq": [{ "$dayOfWeek": "$$dateOnly" }, 1] }, "then": "Domingo" },
                { "case": { "$eq": [{ "$dayOfWeek": "$$dateOnly" }, 2] }, "then": "Lunes" },
                { "case": { "$eq": [{ "$dayOfWeek": "$$dateOnly" }, 3] }, "then": "Martes" },
                { "case": { "$eq": [{ "$dayOfWeek": "$$dateOnly" }, 4] }, "then": "Miércoles" },
                { "case": { "$eq": [{ "$dayOfWeek": "$$dateOnly" }, 5] }, "then": "Jueves" },
                { "case": { "$eq": [{ "$dayOfWeek": "$$dateOnly" }, 6] }, "then": "Viernes" },
                { "case": { "$eq": [{ "$dayOfWeek": "$$dateOnly" }, 7] }, "then": "Sábado" }
              ],
              "default": ""
            }
          }
        }
      }`,
      align: 'left',
      required: true,
    },
    {
      name: 'openingDate',
      visible: true,
      disabled: false,
      filter: true,
      datatype: 'date',
      project: `{ "$dateToString": { "date": "$openingDate", "format": "%d/%m/%Y %H:%M", "timezone": "-03:00" } }`,
      align: 'left',
      required: true,
    },
    {
      name: 'closingDate',
      visible: true,
      disabled: false,
      filter: true,
      datatype: 'date',
      project: `{ "$dateToString": { "date": "$closingDate", "format": "%d/%m/%Y %H:%M", "timezone": "-03:00" } }`,
      align: 'left',
      required: true,
    },
    {
      name: 'state',
      visible: true,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: null,
      align: 'left',
      required: true,
    },
    {
      name: 'employee.name',
      visible: true,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: null,
      align: 'left',
      required: true,
    },
    {
      name: 'type.name',
      visible: true,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: null,
      align: 'left',
      required: true,
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
  private destroy$ = new Subject<void>();
  public rowButtons: IButton[] = [
    {
      title: 'view',
      class: 'btn btn-success btn-sm',
      icon: 'fa fa-eye',
      click: `this.emitEvent('view', item)`,
    },
    {
      title: 'Imprimir',
      class: 'btn btn-light btn-sm',
      icon: 'fa fa-print',
      click: `this.emitEvent('print-box', item, null)`,
    },
  ];
  public headerButtons: IButton[] = [
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
    public _service: CashBoxService,
    private _router: Router,
    public _toastService: ToastService,
    public _printService: PrintService
  ) {}

  public async emitEvent(event) {
    this.openModal(event.op, event.obj);
  }

  public async openModal(op: string, obj: any) {
    switch (op) {
      case 'view':
        this._router.navigateByUrl('report/list-box/' + obj._id);
        break;
      case 'print-box':
        const dataLabels = {
          cashBoxId: obj._id,
        };
        this.toPrint(PrintType.CashBox, dataLabels);
        break;
      default:
    }
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

  public refresh() {
    this.datatableComponent.refresh();
  }
}
