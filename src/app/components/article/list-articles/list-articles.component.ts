import { Component, OnInit, ViewEncapsulation, ViewChild, ElementRef, HostListener } from "@angular/core";
import { Router } from "@angular/router";
import { NgbModal, NgbAlertConfig } from "@ng-bootstrap/ng-bootstrap";
import { attributes } from "../article";
import { IButton } from 'app/util/buttons.interface';
import { ArticleService } from "../article.service";
import { ImportComponent } from "../../import/import.component";
import { PrinterService } from "../../printer/printer.service";
import { DatatableComponent } from '../../datatable/datatable.component';
import { PrintLabelComponent } from "../actions/print-label/print-label.component"
import { ListPriceListsComponent } from "app/components/price-list/list-price-lists/list-price-lists.component";
import { UpdateArticlePriceComponent } from "../update-article-price/update-article-price.component";
import { PrintPriceListComponent } from "app/components/print/print-price-list/print-price-list.component";
import { Type } from '../article'
import { PrintLabelsComponent } from "../actions/print-labels/print-labels.component";
import { PriceListService } from "app/components/price-list/price-list.service";
import { PriceList } from "app/components/price-list/price-list";

@Component({
  selector: "app-list-articles",
  templateUrl: "./list-articles.component.html",
  styleUrls: ["./list-articles.component.scss"],
  encapsulation: ViewEncapsulation.None
})
export class ListArticlesComponent {

  public title: string
  public sort = { "code": 1 };
  public columns = attributes
  public pathLocation: string[]
  public priceListId: string;
  public loading: boolean = false;
  public rowButtons: IButton[] = [
    {
      title: 'view',
      class: 'btn btn-success btn-sm',
      icon: 'fa fa-eye',
      click: `this.emitEvent('view', item, null)`
    },
    {
      title: 'update',
      class: 'btn btn-primary btn-sm',
      icon: 'fa fa-pencil',
      click: `this.emitEvent('update', item, null)`
    }, {
      title: 'delete',
      class: 'btn btn-danger btn-sm',
      icon: 'fa fa-trash-o',
      click: `this.emitEvent('delete', item, null)`
    },
    {
      title: 'Imprimir Etiqueta',
      class: 'btn btn-light btn-sm',
      icon: 'fa fa-barcode',
      click: `this.emitEvent('price-lists', item, null)`
    },
    {
      title: 'Copiar',
      class: 'btn btn-light btn-sm',
      icon: ' fa fa-copy',
      click: `this.emitEvent('copy', item, null)`
    },
    {
      title: 'Historial de Cambios',
      class: "btn btn-light btn-sm",
      icon: 'fa fa-history',
      click: `this.emitEvent('history', item, null)`
    }

  ]
  public headerButtons: IButton[]
  public priceLists: PriceList[]

  @ViewChild(DatatableComponent) datatableComponent: DatatableComponent;

  constructor(
    public _service: ArticleService,
    private _modalService: NgbModal,
    private _router: Router,
    public _printerService: PrinterService,
    public _alertConfig: NgbAlertConfig,
    public _priceListService: PriceListService
  ) {

    let attributeType = this.columns.find(attribute => attribute.name === 'type');

    if (attributeType) {
      this.pathLocation = this._router.url.split("/");
      if (this.pathLocation[2] === "variants") {
        this.title = 'Variantes'
        attributeType.defaultFilter = `{ "$eq": "Variante" }`;
        this.headerButtons = [{
          title: 'refresh',
          class: 'btn btn-light',
          icon: 'fa fa-refresh',
          click: `this.refresh()`
        },
        {
          title: 'Imprimir Etiquetas',
          class: 'btn btn-light',
          icon: 'fa fa-print',
          click: `this.emitEvent('print-labels', null, items)`
        }];
      } else if (this.pathLocation[2] === 'articles') {
        this.title = 'Productos'
        attributeType.defaultFilter = `{ "$eq": "Final" }`;
        this.headerButtons = [{
          title: 'add',
          class: 'btn btn-light',
          icon: 'fa fa-plus',
          click: `this.emitEvent('add', null)`
        }, {
          title: 'refresh',
          class: 'btn btn-light',
          icon: 'fa fa-refresh',
          click: `this.refresh()`
        }, {
          title: 'import',
          class: 'btn btn-light',
          icon: 'fa fa-upload',
          click: `this.emitEvent('uploadFile', null)`
        },
        {
          title: 'Imprimir Etiquetas',
          class: 'btn btn-light',
          icon: 'fa fa-print',
          click: `this.emitEvent('print-labels', null, items)`
        },
        {
          title: 'Actualizar Precios',
          class: 'btn btn-light',
          icon: 'fa fa-edit',
          click: `this.emitEvent('update-prices', null, items)`
        },
        {
          title: ' Imprimir Lista',
          class: 'btn btn-light',
          icon: 'fa fa-print',
          click: `this.emitEvent('print-list', null, items)`
        }
        ];
      }
    }

  }

  public async emitEvent(event) {
    this.openModal(event.op, event.obj, event.items);
  };

  public async openModal(op: string, obj: any, items) {
    let modalRef;
    switch (op) {
      case 'view':
        this.pathLocation[2] === "variants"
          ? this._router.navigateByUrl("admin/variants/view/" + obj._id)
          : this.pathLocation[2] === "articles"
            ? this._router.navigateByUrl("admin/articles/view/" + obj._id)
            : null;
        break;
      case 'add':
        this._router.navigateByUrl("admin/article/add")
        break;
      case 'update':
        this.pathLocation[2] === "variants"
          ? this._router.navigateByUrl("admin/variants/update/" + obj._id)
          : this.pathLocation[2] === "articles"
            ? this._router.navigateByUrl("admin/articles/update/" + obj._id)
            : null;
        break;
      case 'delete':
        this.pathLocation[2] === "variants"
          ? this._router.navigateByUrl("admin/variants/delete/" + obj._id)
          : this.pathLocation[2] === "articles"
            ? this._router.navigateByUrl("admin/articles/delete/" + obj._id)
            : null;
        break;
      case 'uploadFile':
        modalRef = this._modalService.open(ImportComponent, {
          size: 'lg',
          backdrop: 'static',
        });
        modalRef.componentInstance.model = 'articles'
        modalRef.componentInstance.title = 'Importar artículos'
        modalRef.result.then(
          (result) => {
            if (result === 'save_close') {
              this.refresh();
            }
          },
          (reason) => { },
        );

        break;
      case 'history':
        if (obj.type === Type.Variant) {
          this._router.navigateByUrl(`/admin/variants/history/${obj._id}`);
        } else {
          this._router.navigateByUrl(`/admin/articles/history/${obj._id}`);
        }
        break;
      case 'print-label':
        this.loading = true
        const printLabelComponent = new PrintLabelComponent(this._printerService, this._alertConfig);
        printLabelComponent.articleId = obj._id;
        printLabelComponent.ngOnInit()
        this.loading = false
        break;
      case "print-labels":
        this.loading = true
        const articlesIds: string[] = items.map(objeto => objeto._id);
        const printLabelsComponent = new PrintLabelsComponent(this._printerService, this._alertConfig);
        printLabelsComponent.articleIds = articlesIds;
        printLabelsComponent.ngOnInit()
        this.loading = false
        break;
      case 'copy':
        this._router.navigateByUrl("admin/articles/copy/" + obj._id)
        break
      case "price-lists":
        this.getPriceLists()
        if(!this.priceLists.length){
          return this.openModal("print-label", obj, null);
        }
        modalRef = this._modalService.open(ListPriceListsComponent, {
          size: "lg",
          backdrop: "static",
        });
        modalRef.result.then(
          (result) => {
            if (result && result.priceList) {
              this.priceListId = result.priceList;
              this.openModal("print-label", obj, null);
            } else {
              this.openModal("print-label", obj, null);
            }
          },
          (reason) => {
            this.refresh()
          }
        );

        break;
      case "update-prices":
        modalRef = this._modalService.open(UpdateArticlePriceComponent);
        modalRef.componentInstance.articles = items;
        modalRef.result.then(
          (result) => {
            this.refresh()
          },
          (reason) => {
            this.refresh()
          }
        );
        break;
      case "print-list":
        modalRef = this._modalService.open(PrintPriceListComponent);
        modalRef.result.then(
          (result) => {
            this.refresh()
          },
          (reason) => {
            this.refresh()
          }
        );
        break;
      default:
    }
  };

  public refresh() {
    this.datatableComponent.refresh();
  }

  public getPriceLists() : void {
    this._priceListService.getPriceLists().subscribe(
        result => {
            if(result.priceLists){
                this.priceLists = result.priceLists;
            }else{
              this.priceLists = []
            }
        }
    )
}
}
