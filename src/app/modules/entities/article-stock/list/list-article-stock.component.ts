import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ArticleStockService } from '@core/services/article-stock.service';
import { PrintService } from '@core/services/print.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ImportComponent } from '@shared/components/import/import.component';
import { ToastService } from '@shared/components/toast/toast.service';
import { ApiResponse, IAttribute, IButton, PrintType } from '@types';
import { DatatableComponent } from 'app/components/datatable/datatable.component';
import { DatatableModule } from 'app/components/datatable/datatable.module';
import * as printJS from 'print-js';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-list-structure',
  templateUrl: './list-article-stock.component.html',
  standalone: true,
  imports: [DatatableModule],
})
export class ListArticleStockComponent implements OnInit {
  public title: string = 'inventory';
  public sort = { code: 1 };

  public pathLocation: string[];
  public loading: boolean = false;
  public headerButtons: IButton[] = [
    {
      title: 'refresh',
      class: 'btn btn-light',
      icon: 'fa fa-refresh',
      click: `this.refresh()`,
    },
    {
      title: 'Imprimir Inventario',
      class: 'btn btn-light',
      icon: 'fa fa-print',
      click: `this.emitEvent('print-inventario', null)`,
    },
    {
      title: 'import',
      class: 'btn btn-light',
      icon: 'fa fa-upload',
      click: `this.emitEvent('uploadFile', null)`,
    },
  ];
  public rowButtons: IButton[] = [
    // {
    //   title: 'view',
    //   class: 'btn btn-success btn-sm',
    //   icon: 'fa fa-eye',
    //   click: `this.emitEvent('view', item)`,
    // },
    // {
    //   title: 'update',
    //   class: 'btn btn-primary btn-sm',
    //   icon: 'fa fa-pencil',
    //   click: `this.emitEvent('update', item)`,
    // },
    // {
    //   title: 'delete',
    //   class: 'btn btn-danger btn-sm',
    //   icon: 'fa fa-trash-o',
    //   click: `this.emitEvent('delete', item)`,
    // },
  ];
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
      name: 'branch.name',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: null,
      align: 'left',
      required: false,
    },
    {
      name: 'deposit.name',
      visible: true,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: null,
      align: 'left',
      required: false,
    },
    {
      name: 'article.code',
      visible: true,
      disabled: false,
      filter: true,
      datatype: 'string',
      // defaultFilter: `{ "$exists": true, "$ne": null }`,
      project: null,
      align: 'left',
      required: false,
    },
    {
      name: 'article.barcode',
      visible: true,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: null,
      align: 'left',
      required: false,
    },
    {
      name: 'article.make.description',
      visible: true,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: null,
      align: 'left',
      required: false,
    },
    {
      name: 'article.category.description',
      visible: true,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: null,
      align: 'left',
      required: false,
    },
    {
      name: 'article.category.parent.description',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: null,
      align: 'left',
      required: false,
    },

    {
      name: 'article.description',
      visible: true,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: null,
      align: 'left',
      required: false,
    },
    {
      name: 'article.observation',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: null,
      align: 'left',
      required: false,
    },
    {
      name: 'article.variantType1.name',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: null,
      align: 'left',
      required: true,
    },
    {
      name: 'article.variantValue1.description',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: null,
      align: 'left',
      required: true,
    },
    {
      name: 'article.posDescription',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: null,
      align: 'left',
      required: false,
    },
    {
      name: 'article.ecommerceEnabled',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'boolean',
      project: `{"$toString":"$article.ecommerceEnabled"}`,
      align: 'left',
      required: false,
    },
    {
      name: 'applicationsName',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: `{"$reduce":{"input":"$article.applications.name","initialValue":"","in":{"$concat":["$$value",{"$cond":{"if":{"$eq":["$$value",""]},"then":"","else":"; "}},{"$concat":[{"$toString":"$$this"},""]}]}}}`,
      align: 'left',
      required: false,
    },
    {
      name: 'article.otherFieldsValues',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: `{"$reduce":{"input":"$article.otherFields.value","initialValue":"","in":{"$concat":["$$value",{"$cond":{"if":{"$eq":["$$value",""]},"then":"","else":"; "}},{"$concat":[{"$toString":"$$this"},""]}]}}}`,
      align: 'left',
      required: false,
    },
    {
      name: 'realStock',
      visible: true,
      disabled: false,
      filter: true,
      datatype: 'number',
      project: null,
      align: 'right',
      required: true,
    },
    {
      name: 'article.minStock',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'number',
      project: null,
      align: 'right',
      required: true,
    },
    {
      name: 'article.maxStock',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'number',
      project: null,
      align: 'right',
      required: true,
    },
    {
      name: 'article.pointOfOrder',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'number',
      project: null,
      align: 'right',
      required: true,
    },
    {
      name: 'article.basePrice',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'currency',
      project: null,
      align: 'right',
      required: true,
    },
    {
      name: 'article.codeProvider',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: null,
      align: 'right',
      required: false,
    },
    {
      name: 'article.containsStructure',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: null,
      align: 'right',
      required: false,
    },
    {
      name: 'article.salePrice',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'currency',
      project: null,
      align: 'right',
      required: false,
    },
    {
      name: 'article.currency.name',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: null,
      align: 'right',
      required: true,
    },
    {
      name: 'article.currency.quotation',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'currency',
      project: null,
      align: 'right',
      required: true,
    },
    {
      name: 'article.costPrice',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'currency',
      project: null,
      align: 'right',
      required: true,
    },
    {
      name: 'creationDate',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: `{ "$dateToString": { "date": "$creationDate", "format": "%d/%m/%Y", "timezone": "-03:00" } }`,
      align: 'left',
      required: true,
    },
    {
      name: 'updateDate',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: `{ "$dateToString": { "date": "$updateDate", "format": "%d/%m/%Y", "timezone": "-03:00" } }`,
      align: 'left',
      required: true,
    },
    {
      name: 'total',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'currency',
      project: `{ "$multiply": [ "$article.costPrice", "$realStock" ] }`,
      align: 'right',
      required: true,
    },
    {
      name: 'article.operationType',
      visible: false,
      disabled: true,
      filter: true,
      defaultFilter: `{ "$ne": "D" }`,
      datatype: 'string',
      project: null,
      align: 'left',
      required: true,
    },
    {
      name: 'operationType',
      visible: false,
      disabled: true,
      filter: true,
      defaultFilter: `{ "$ne": "D" }`,
      datatype: 'string',
      project: null,
      align: 'left',
      required: true,
    },
    {
      name: 'article.allowStock',
      visible: false,
      disabled: true,
      filter: true,
      datatype: 'string',
      project: null,
      align: 'left',
      required: true,
    },
    {
      name: 'article._id',
      visible: false,
      disabled: true,
      filter: true,
      datatype: 'string',
      defaultFilter: `{ "$exists": true, "$ne": null }`,
      align: 'left',
      required: true,
    },
  ];
  private destroy$ = new Subject<void>();

  @ViewChild(DatatableComponent) datatableComponent: DatatableComponent;

  constructor(
    public _service: ArticleStockService,
    private _router: Router,
    private _modalService: NgbModal,
    private _toastService: ToastService,
    private _printService: PrintService
  ) {}
  ngOnInit() {}

  public async emitEvent(event) {
    this.redirect(event.op, event.obj);
  }

  public async redirect(op: string, obj: any) {
    let modalRef;
    switch (op) {
      case 'view':
        this._router.navigateByUrl('entities/structures/view/' + obj._id);
        break;
      case 'update':
        this._router.navigateByUrl('entities/structures/update/' + obj._id);
        break;
      case 'delete':
        this._router.navigateByUrl('entities/structures/delete/' + obj._id);
        break;
      case 'add':
        this._router.navigateByUrl('entities/structures/add');
        break;
      case 'print-inventario':
        this.toPrint(PrintType.Inventory, null);
        break;
      case 'uploadFile':
        modalRef = this._modalService.open(ImportComponent, {
          size: 'lg',
          backdrop: 'static',
        });
        modalRef.componentInstance.model = 'articles-stock';
        modalRef.componentInstance.title = 'Importar stock';

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
