import { Component, ViewChild, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { PrintService } from '@core/services/print.service';
import { NgbAlertConfig } from '@ng-bootstrap/ng-bootstrap';
import { ToastService } from '@shared/components/toast/toast.service';
import { ApiResponse, IButton, PrintType } from '@types';
import { PriceList } from 'app/components/price-list/price-list';
import { PriceListService } from 'app/core/services/price-list.service';
import * as printJS from 'print-js';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ArticleService } from '../../../core/services/article.service';
import { PrinterService } from '../../../core/services/printer.service';
import { DatatableComponent } from '../../datatable/datatable.component';
import { attributesVariant } from '../article';

@Component({
  selector: 'app-list-variants',
  templateUrl: './list-variants.component.html',
  encapsulation: ViewEncapsulation.None,
})
export class ListVariantsComponent {
  public title: string = 'variants';
  public sort = { code: 1 };
  public columns = attributesVariant;
  public pathLocation: string[];
  public priceListId: string;
  public loading: boolean = false;
  public headerButtons: IButton[] = [
    {
      title: 'Imprimir Etiquetas',
      class: 'btn btn-light',
      icon: 'fa fa-print',
      click: `this.emitEvent('print-labels', null, items)`,
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
      title: 'Imprimir Etiqueta',
      class: 'btn btn-light btn-sm',
      icon: 'fa fa-barcode',
      click: `this.emitEvent('print-label', item, null)`,
    },
    {
      title: 'Historial de Cambios',
      class: 'btn btn-light btn-sm',
      icon: 'fa fa-history',
      click: `this.emitEvent('history', item, null)`,
    },
  ];
  public priceLists: PriceList[];
  private destroy$ = new Subject<void>();

  @ViewChild(DatatableComponent) datatableComponent: DatatableComponent;

  constructor(
    public _service: ArticleService,
    private _router: Router,
    public _printerService: PrinterService,
    public _alertConfig: NgbAlertConfig,
    public _priceListService: PriceListService,
    public _printService: PrintService,
    private _toastService: ToastService
  ) {}

  public async emitEvent(event) {
    this.openModal(event.op, event.obj, event.items);
  }

  public async openModal(op: string, obj: any, items) {
    let currentUrl;
    switch (op) {
      case 'view':
        currentUrl = encodeURIComponent(this._router.url);
        this._router.navigate(['/admin/variants/view', obj._id], {
          queryParams: { returnURL: currentUrl },
        });
        break;
      case 'update':
        currentUrl = encodeURIComponent(this._router.url);
        this._router.navigate(['/admin/variants/update', obj._id], {
          queryParams: { returnURL: currentUrl },
        });
        break;
      case 'delete':
        currentUrl = encodeURIComponent(this._router.url);
        this._router.navigate(['/admin/variants/delete', obj._id], {
          queryParams: { returnURL: currentUrl },
        });
        break;
      case 'history':
        currentUrl = encodeURIComponent(this._router.url);
        this._router.navigate(['/admin/variants/history', obj._id], {
          queryParams: { returnURL: currentUrl },
        });
        break;
      case 'print-label':
        const datalabel = {
          quantity: 1,
          articleId: obj._id,
        };
        this.toPrint(PrintType.Article, datalabel);
        break;
      case 'print-labels':
        const dataLabels = {
          articlesIds: items.map((objeto) => objeto._id),
        };
        this.toPrint(PrintType.Labels, dataLabels);
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
