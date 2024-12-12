import { Component, ViewChild, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { NgbAlertConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { IButton } from '@types';
import { PriceList } from 'app/components/price-list/price-list';
import { PrintPriceListComponent } from 'app/components/print/print-price-list/print-price-list.component';
import { PriceListService } from 'app/core/services/price-list.service';
import { ImportComponent } from 'app/shared/components/import/import.component';
import { ArticleService } from '../../../core/services/article.service';
import { PrinterService } from '../../../core/services/printer.service';
import { DatatableComponent } from '../../datatable/datatable.component';
import { PrintLabelComponent } from '../actions/print-label/print-label.component';
import { PrintLabelsComponent } from '../actions/print-labels/print-labels.component';
import { UpdateArticlePriceComponent } from '../actions/update-article-price/update-article-price.component';
import { attributes } from '../article';

@Component({
  selector: 'app-list-articles',
  templateUrl: './list-articles.component.html',
  styleUrls: ['./list-articles.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ListArticlesComponent {
  public title: string = 'articles';
  public sort = { code: 1 };
  public columns = attributes;
  public pathLocation: string[];
  public priceListId: string;
  public loading: boolean = false;
  public headerButtons: IButton[] = [
    {
      title: 'add',
      class: 'btn btn-light',
      icon: 'fa fa-plus',
      click: `this.emitEvent('add', null)`,
    },
    // {
    //   title: 'import',
    //   class: 'btn btn-light',
    //   icon: 'fa fa-upload',
    //   click: `this.emitEvent('uploadFile', null)`,
    // },
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
      title: ' Imprimir Lista',
      class: 'btn btn-light',
      icon: 'fa fa-print',
      click: `this.emitEvent('print-list', null, items)`,
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
    {
      title: 'Imprimir Etiqueta',
      class: 'btn btn-light btn-sm',
      icon: 'fa fa-barcode',
      click: `this.emitEvent('print-label', item, null)`,
    },
    {
      title: 'Copiar',
      class: 'btn btn-light btn-sm',
      icon: ' fa fa-copy',
      click: `this.emitEvent('copy', item, null)`,
    },
    {
      title: 'Historial de Cambios',
      class: 'btn btn-light btn-sm',
      icon: 'fa fa-history',
      click: `this.emitEvent('history', item, null)`,
    },
  ];
  public priceLists: PriceList[];

  @ViewChild(DatatableComponent) datatableComponent: DatatableComponent;

  constructor(
    public _service: ArticleService,
    private _modalService: NgbModal,
    private _router: Router,
    public _printerService: PrinterService,
    public _alertConfig: NgbAlertConfig,
    public _priceListService: PriceListService
  ) {}

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
        this.loading = true;
        const printLabelComponent = new PrintLabelComponent(
          this._printerService,
          this._alertConfig
        );
        printLabelComponent.articleId = obj._id;
        printLabelComponent.ngOnInit();
        this.loading = false;
        break;
      case 'print-labels':
        this.loading = true;
        const articlesIds: string[] = items.map((objeto) => objeto._id);
        const printLabelsComponent = new PrintLabelsComponent(
          this._printerService,
          this._alertConfig
        );
        printLabelsComponent.articleIds = articlesIds;
        printLabelsComponent.ngOnInit();
        this.loading = false;
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
}
