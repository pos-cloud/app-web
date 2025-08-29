import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { PrintService } from '@core/services/print.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SelectPrinterComponent } from '@shared/components/select-printer/select-printer.component';
import { ToastService } from '@shared/components/toast/toast.service';
import { ApiResponse, IAttribute, IButton, PrinterPrintIn, PrintType } from '@types';
import { PrintPriceListComponent } from 'app/components/article/actions/print-price-list/print-price-list.component';
import { ImportComponent } from 'app/shared/components/import/import.component';
import * as printJS from 'print-js';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ArticleService } from '../../../core/services/article.service';
import { PrinterService } from '../../../core/services/printer.service';
import { DatatableComponent } from '../../datatable/datatable.component';
import { UpdateArticlePriceComponent } from '../actions/update-article-price/update-article-price.component';

@Component({
  selector: 'app-list-articles',
  templateUrl: './list-articles.component.html',
  styleUrls: ['./list-articles.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ListArticlesComponent implements OnInit {
  public title: string = 'articles';
  public sort = { code: 1 };
  public loading: boolean = false;
  private destroy$ = new Subject<void>();
  private user;
  public columns: IAttribute[] = [
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
      name: 'unitOfMeasurement.name',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: null,
      align: 'left',
      required: false,
    },
    {
      name: 'unitOfMeasurement.abbreviation',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: null,
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
      datatype: 'string',
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
      datatype: 'string',
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
      name: 'type',
      visible: false,
      disabled: true,
      filter: false,
      datatype: 'string',
      defaultFilter: `{ "$eq": "Final" }`,
      project: null,
      align: 'left',
      required: true,
    },
  ];
  public headerButtons: IButton[] = [];
  public rowButtons: IButton[] = [];
  @ViewChild(DatatableComponent) datatableComponent: DatatableComponent;

  constructor(
    public _service: ArticleService,
    private _modalService: NgbModal,
    private _router: Router,
    public _printerService: PrinterService,
    public _printService: PrintService,
    private _toastService: ToastService,
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
        this._router.navigate(['/admin/articles/view', obj._id], {
          queryParams: { returnURL: currentUrl },
        });
        break;
      case 'add':
        currentUrl = encodeURIComponent(this._router.url);
        this._router.navigate(['/admin/articles/add'], {
          queryParams: { returnURL: currentUrl },
        });
        break;
      case 'update':
        currentUrl = encodeURIComponent(this._router.url);
        this._router.navigate(['/admin/articles/update', obj._id], {
          queryParams: { returnURL: currentUrl },
        });
        break;
      case 'delete':
        currentUrl = encodeURIComponent(this._router.url);
        this._router.navigate(['/admin/articles/delete', obj._id], {
          queryParams: { returnURL: currentUrl },
        });
        break;
      case 'uploadFile':
        modalRef = this._modalService.open(ImportComponent, {
          size: 'lg',
          backdrop: 'static',
        });
        modalRef.componentInstance.model = 'articles';
        modalRef.componentInstance.title = 'Importar artículos';
        modalRef.result.then(
          (result) => {
            if (result === 'save_close') {
              this.refresh();
            }
          },
          (reason) => {}
        );

        break;
      case 'history':
        currentUrl = encodeURIComponent(this._router.url);
        this._router.navigate(['/admin/articles/history', obj._id], {
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
      case 'copy':
        currentUrl = encodeURIComponent(this._router.url);
        this._router.navigate(['/admin/articles/copy', obj._id], {
          queryParams: { returnURL: currentUrl },
        });
        break;
      case 'update-prices':
        modalRef = this._modalService.open(UpdateArticlePriceComponent);
        modalRef.componentInstance.articles = items;
        modalRef.result.then(
          (result) => {
            this.refresh();
          },
          (reason) => {
            this.refresh();
          }
        );
        break;
      case 'print-list':
        modalRef = this._modalService.open(PrintPriceListComponent);
        modalRef.result.then(
          (result) => {
            this.refresh();
          },
          (reason) => {
            this.refresh();
          }
        );
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
    if (this.user.permission.collections.articles.delete) {
      this.rowButtons.push({
        title: 'delete',
        class: 'btn btn-danger btn-sm',
        icon: 'fa fa-trash-o',
        click: `this.emitEvent('delete', item, null)`,
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
        title: 'Copiar',
        class: 'btn btn-light btn-sm',
        icon: 'fa fa-copy',
        click: `this.emitEvent('copy', item, null)`,
      },
      {
        title: 'Historial de Cambios',
        class: 'btn btn-light btn-sm',
        icon: 'fa fa-history',
        click: `this.emitEvent('history', item, null)`,
      }
    );

    if (this.user.permission.collections.articles.add) {
      this.headerButtons.push({
        title: 'add',
        class: 'btn btn-light',
        icon: 'fa fa-plus',
        click: `this.emitEvent('add', null)`,
      });
    }

    this.headerButtons.push(
      {
        title: 'import',
        class: 'btn btn-light',
        icon: 'fa fa-upload',
        click: `this.emitEvent('uploadFile', null)`,
      },
      {
        title: 'Imprimir Etiquetas',
        class: 'btn btn-light',
        icon: 'fa fa-print',
        click: `this.emitEvent('print-labels', null, items)`,
      },
      {
        title: 'Actualizar Precios',
        class: 'btn btn-light',
        icon: 'fa fa-edit',
        click: `this.emitEvent('update-prices', null, items)`,
      },
      {
        title: 'Imprimir Lista',
        class: 'btn btn-light',
        icon: 'fa fa-print',
        click: `this.emitEvent('print-list', null, items)`,
      },
      {
        title: 'refresh',
        class: 'btn btn-light',
        icon: 'fa fa-refresh',
        click: `this.refresh()`,
      }
    );
  }
}
