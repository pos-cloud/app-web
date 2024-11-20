import { Component, ViewChild, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { NgbAlertConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { IButton } from '@types';
import { PriceList } from 'app/components/price-list/price-list';
import { PriceListService } from 'app/components/price-list/price-list.service';
import { DatatableComponent } from '../../datatable/datatable.component';
import { PrinterService } from '../../printer/printer.service';
import { PrintLabelComponent } from '../actions/print-label/print-label.component';
import { PrintLabelsComponent } from '../actions/print-labels/print-labels.component';
import { attributesVariant } from '../article';
import { ArticleService } from '../article.service';

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
      default:
    }
  }

  public refresh() {
    this.datatableComponent.refresh();
  }
}
