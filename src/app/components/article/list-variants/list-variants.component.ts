import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { PrintService } from '@core/services/print.service';
import { NgbAlertConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SelectPrinterComponent } from '@shared/components/select-printer/select-printer.component';
import { ToastService } from '@shared/components/toast/toast.service';
import { ApiResponse, IButton, PriceList, PrinterPrintIn, PrintType } from '@types';
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
export class ListVariantsComponent implements OnInit {
  public title: string = 'variants';
  public sort = { code: 1 };
  public columns = attributesVariant;
  public pathLocation: string[];
  public priceListId: string;
  public loading: boolean = false;
  user;
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
  public rowButtons: IButton[] = [];
  public priceLists: PriceList[];
  private destroy$ = new Subject<void>();

  @ViewChild(DatatableComponent) datatableComponent: DatatableComponent;

  constructor(
    public _service: ArticleService,
    private _router: Router,
    public _printerService: PrinterService,
    public _alertConfig: NgbAlertConfig,
    public _printService: PrintService,
    private _toastService: ToastService,
    private _modalService: NgbModal,
    private _authService: AuthService
  ) {}

  async ngOnInit() {
    this.getPermissions();
  }

  public async emitEvent(event) {
    this.openModal(event.op, event.obj, event.items);
  }

  public async openModal(op: string, obj: any, items) {
    let modalRef;
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
        modalRef = this._modalService.open(SelectPrinterComponent, {
          size: 'lg',
          backdrop: 'static',
        });
        modalRef.componentInstance.typePrinter = PrinterPrintIn.Label;
        modalRef.result.then(
          (result) => {
            if (result.data) {
              const datalabel = {
                quantity: 1,
                articleId: obj._id,
                printerId: result.data._id,
              };
              this.toPrint(PrintType.Article, datalabel);
            }
          },
          (reason) => {}
        );
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
  private getPermissions(): void {
    this._authService.getIdentity.pipe(takeUntil(this.destroy$)).subscribe((identity) => {
      if (identity) {
        this.user = identity;
        this.configureButtons();
      }
    });
  }

  private configureButtons(): void {
    this.rowButtons.push({
      title: 'view',
      class: 'btn btn-success btn-sm',
      icon: 'fa fa-eye',
      click: `this.emitEvent('view', item, null)`,
    });

    if (this.user.permission.collections.articles.edit) {
      this.rowButtons.push({
        title: 'update',
        class: 'btn btn-primary btn-sm',
        icon: 'fa fa-pencil',
        click: `this.emitEvent('update', item, null)`,
      });
    }

    this.rowButtons.push(
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
      }
    );
  }
}
