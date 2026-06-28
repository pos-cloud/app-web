import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { ArticleService } from '@core/services/article.service';
import { AuthService } from '@core/services/auth.service';
import { PrintService } from '@core/services/print.service';
import { PrinterService } from '@core/services/printer.service';
import { NgbAlertConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SelectPrinterComponent } from '@shared/components/select-printer/select-printer.component';
import { ToastService } from '@shared/components/toast/toast.service';
import { ApiResponse, IButton, PriceList, PrinterPrintIn, PrintType } from '@types';
import { DatatableComponent } from 'app/components/datatable/datatable.component';
import { DatatableModule } from 'app/components/datatable/datatable.module';
import * as printJS from 'print-js';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-list-articles-variants',
  templateUrl: './list-articles-variants.component.html',
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [DatatableModule],
})
export class ListVariantsComponent implements OnInit {
  public title: string = 'variants';
  public sort = { code: 1 };
  public columns = [
    {
      name: 'order',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'number',
      project: null,
      align: 'left',
      required: false,
    },
    {
      name: 'code',
      visible: true,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: null,
      align: 'left',
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
      name: 'posDescription',
      visible: true,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: null,
      align: 'left',
      required: false,
    },
    {
      name: 'make.description',
      visible: true,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: null,
      align: 'left',
      required: false,
    },
    {
      name: 'category.description',
      visible: true,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: null,
      align: 'left',
      required: false,
    },
    {
      name: 'category.parent.description',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: null,
      align: 'left',
      required: false,
    },
    {
      name: 'costPrice2',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'currency',
      project: null,
      align: 'right',
      required: false,
    },
    {
      name: 'salePriceTN',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'currency',
      project: null,
      align: 'right',
      required: false,
    },
    {
      name: 'salePrice',
      visible: true,
      disabled: false,
      filter: true,
      datatype: 'currency',
      project: null,
      align: 'right',
      required: false,
    },
    {
      name: 'purchasePrice',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'currency',
      project: null,
      align: 'right',
      required: false,
    },
    {
      name: 'taxesPercentage',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: `{"$reduce":{"input":"$taxes.percentage","initialValue":"","in":{"$concat":["$$value",{"$cond":{"if":{"$eq":["$$value",""]},"then":"","else":"; "}},{"$concat":[{"$toString":"$$this"},"%"]}]}}}`,
      align: 'left',
      required: false,
    },
    {
      name: 'currency.name',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: null,
      align: 'left',
      required: false,
    },
    {
      name: 'observation',
      visible: true,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: null,
      align: 'left',
      required: false,
    },
    {
      name: 'barcode',
      visible: true,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: null,
      align: 'left',
      required: false,
    },
    {
      name: 'season',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: null,
      align: 'left',
      required: false,
    },
    {
      name: 'costPrice',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'currency',
      project: null,
      align: 'right',
      required: false,
    },
    {
      name: 'basePrice',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'currency',
      project: null,
      align: 'right',
      required: false,
    },
    {
      name: 'markupPercentage',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'percent',
      project: null,
      align: 'right',
      required: false,
    },
    {
      name: 'markupPrice',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'currency',
      project: null,
      align: 'right',
      required: false,
    },
    {
      name: 'printIn',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: null,
      align: 'left',
      required: false,
    },
    {
      name: 'allowPurchase',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'boolean',
      project: null,
      align: 'left',
      required: false,
    },
    {
      name: 'codeProvider',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: null,
      align: 'left',
      required: false,
    },
    {
      name: 'allowSale',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'boolean',
      project: null,
      align: 'left',
      required: false,
    },
    {
      name: 'allowPurchase',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'boolean',
      project: null,
      align: 'left',
      required: false,
    },
    {
      name: 'allowSaleWithoutStock',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'boolean',
      project: null,
      align: 'left',
      required: false,
    },
    {
      name: 'allowMeasure',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'boolean',
      project: null,
      align: 'left',
      required: false,
    },
    {
      name: 'isWeigth',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'boolean',
      project: null,
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
      name: 'applicationsName',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: `{"$reduce":{"input":"$applications.name","initialValue":"","in":{"$concat":["$$value",{"$cond":{"if":{"$eq":["$$value",""]},"then":"","else":"; "}},{"$concat":[{"$toString":"$$this"},""]}]}}}`,
      align: 'left',
      required: false,
    },
    {
      name: 'url',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: null,
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
      name: 'posKitchen',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'boolean',
      project: null,
      align: 'left',
      required: false,
    },
    {
      name: 'tags',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: `{"$reduce":{"input":"$tags","initialValue":"","in":{"$concat":["$$value",{"$cond":{"if":{"$eq":["$$value",""]},"then":"","else":"; "}},{"$concat":[{"$toString":"$$this"}]}]}}}`,
      align: 'left',
      required: false,
    },
    {
      name: 'wooId',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'number',
      project: null,
      align: 'left',
      required: true,
    },
    {
      name: 'meliId',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: null,
      align: 'left',
      required: true,
    },
    {
      name: 'tiendaNubeId',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'number',
      project: null,
      align: 'left',
      required: true,
    },
    {
      name: 'variantType1.name',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: null,
      align: 'left',
      required: true,
    },
    {
      name: 'variantValue1.description',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: null,
      align: 'left',
      required: true,
    },
    {
      name: 'variantType2.name',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: null,
      align: 'left',
      required: true,
    },
    {
      name: 'variantValue2.description',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: null,
      align: 'left',
      required: true,
    },
    {
      name: 'provider.name',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: null,
      align: 'left',
      required: false,
    },
    {
      name: 'type',
      visible: false,
      disabled: false,
      filter: false,
      datatype: 'string',
      defaultFilter: `{ "$eq": "Variante" }`,
      project: null,
      align: 'left',
      required: true,
    },
    {
      name: 'containsVariants',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'boolean',
      project: null,
      align: 'left',
      required: true,
    },
    {
      name: 'containsStructure',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'boolean',
      project: null,
      align: 'left',
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
    {
      name: 'weight',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: null,
      align: 'left',
      required: false,
    },
    {
      name: 'depth',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: null,
      align: 'left',
      required: false,
    },
    {
      name: 'width',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: null,
      align: 'left',
      required: false,
    },
    {
      name: 'height',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: null,
      align: 'left',
      required: false,
    },
    {
      name: 'm3',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'number',
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
      name: 'showMenu',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'boolean',
      project: null,
      align: 'left',
      required: true,
    },
    {
      name: '_id',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: null,
      align: 'left',
      required: false,
    },
  ];
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
        this._router.navigateByUrl('entities/articles/view/' + obj._id);
        break;
      case 'update':
        this._router.navigateByUrl('entities/articles/update/' + obj._id);
        break;
      case 'delete':
        this._router.navigateByUrl('entities/articles/delete/' + obj._id);
        break;
      case 'history':
        currentUrl = encodeURIComponent(this._router.url);
        this._router.navigate(['/entities/articles/history', obj._id], {
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
