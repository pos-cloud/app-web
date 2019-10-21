
import { Component, OnInit, ViewEncapsulation, ViewChild, LOCALE_ID } from '@angular/core';
import { Router } from '@angular/router';
import { registerLocaleData } from '@angular/common';
import localeEsAr from '@angular/common/locales/es-AR';
registerLocaleData(localeEsAr, 'es-Ar');

import { NgbModal, NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { Article, ArticleType, columns } from './../../models/article';
import { Config } from './../../app.config';

import { ArticleService } from './../../services/article.service';

import { AddArticleComponent } from './../../components/add-article/add-article.component';
import { DeleteArticleComponent } from './../../components/delete-article/delete-article.component';
import { ImportComponent } from './../../components/import/import.component';

import { RoundNumberPipe } from './../../pipes/round-number.pipe';
import { Printer, PrinterPrintIn } from '../../models/printer';
import { PrinterService } from '../../services/printer.service';
import { UpdateArticlePriceComponent } from '../update-article-price/update-article-price.component';
import { AuthService } from 'app/services/auth.service';
import { User } from 'app/models/user';
import { PrintPriceListComponent } from '../print/print-price-list/print-price-list.component';
import { TaxService } from 'app/services/tax.service';
import { Tax } from 'app/models/tax';
import { ConfigService } from 'app/services/config.service';
import { Claim, ClaimPriority, ClaimType } from 'app/models/claim';
import { ClaimService } from 'app/services/claim.service';
import { PrintLabelComponent } from '../print/print-label/print-label.component';
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';
import { ExportExcelComponent } from '../export/export-excel/export-excel.component';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-reports-list',
  templateUrl: './reports-list.component.html',
  styleUrls: ['./reports-list.component.scss'],
  providers: [ NgbAlertConfig, { provide: LOCALE_ID, useValue: 'es-Ar' } ],
  encapsulation: ViewEncapsulation.None,
})

export class ReportsList implements OnInit {

  public identity: User;
  public alertMessage: string = '';
  public loading: boolean = false;
  public articleType: ArticleType;
  public config: Config;
  private roundNumberPipe: RoundNumberPipe = new RoundNumberPipe();
  private currencyPipe: CurrencyPipe = new CurrencyPipe('es-Ar');
  @ViewChild(ExportExcelComponent, {static: true}) exportExcelComponent: ExportExcelComponent;
  
  // TABLA
  public listTitle: string;
  public columns: any[] = columns;
  public filters: any[];
  public orderTerm: string[] = ["description"];
  public currentPage: number = 0;
  public itemsPerPage = 10;
  public totalItems: number = 0;
  public items: Article[] = new Array();
  
  constructor(
    private _articleService: ArticleService,
    private _router: Router,
    private _modalService: NgbModal,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig,
    private _printerService: PrinterService,
    private _authService: AuthService,
    private _taxService: TaxService,
    private _configService: ConfigService,
    private _claimService: ClaimService
  ) {
    this.filters = new Array();
    this.items = new Array();
    for(let field of this.columns) {
      this.filters[field.name] = "";
    }
  }

  async ngOnInit() {

    let pathLocation: string[] = this._router.url.split('/');
    this.listTitle = pathLocation[2].charAt(0).toUpperCase() + pathLocation[2].slice(1);

    this._authService.getIdentity.subscribe(
      identity => {
        this.identity = identity;
      }
    );

    await this._configService.getConfig.subscribe(
      config => {
        this.config = config;
      }
    );

    if ('Variantes' === this.listTitle) {
      this.articleType = ArticleType.Variant;
    } else if ('Ingredientes' === this.listTitle) {
      this.articleType = ArticleType.Ingredient;
    } else {
      // ENTRA CUANDO SE HACE UNA TRANSACCIÓN O EN LA TABLA
      this.articleType = ArticleType.Final;
    }
    this.getItems();
  }

  public drop(event: CdkDragDrop<string[]>): void {
    moveItemInArray(this.columns, event.previousIndex, event.currentIndex);
  }

  public getItems(): void {
    
    this.loading = true;

    /// ORDENAMOS LA CONSULTA
    let sort = {};
    let sortAux;
      if (this.orderTerm[0].charAt(0) === '-') {
          sortAux = `{ "${this.orderTerm[0].split('-')[1]}" : -1 }`;
      } else {
          sortAux = `{ "${this.orderTerm[0]}" : 1 }`;
      }
    sort = JSON.parse(sortAux);

    // FILTRAMOS LA CONSULTA
    let match = `{`;
    for(let i = 0; i < this.columns.length; i++) {
      if(this.columns[i].visible) {
        let value = this.filters[this.columns[i].name];
        if (value && value != "") {
          match += `"${this.columns[i].name}": { "$regex": "${value}", "$options": "i"}`;
          if (i < this.columns.length - 1) {
            match += ',';
          }
        }
      }
    }
    if (match.charAt(match.length - 1) === '"' || match.charAt(match.length - 1) === '}') match += `,`;
    match += `"type": "${this.articleType}", "operationType": { "$ne": "D" } }`;
    match = JSON.parse(match);

    // ARMAMOS EL PROJECT SEGÚN DISPLAYCOLUMNS
    let project = `{`;
    let j = 0;
    for(let i = 0; i < this.columns.length; i++) {
      if(this.columns[i].visible) {
        if(j > 0) {
          project += `,`;
        }
        j++;
        project += `"${this.columns[i].name}": 1`;
      }
    }
    project += `}`;
    project = JSON.parse(project);

    // AGRUPAMOS EL RESULTADO
    let group = {
        _id: null,
        count: { $sum: 1 },
        items: { $push: "$$ROOT" }
    };

    let page = 0;
    if(this.currentPage != 0) {
      page = this.currentPage - 1;
    }
    let skip = !isNaN(page * this.itemsPerPage) ?
            (page * this.itemsPerPage) :
            0 // SKIP
    let limit = this.itemsPerPage;
    this._articleService.getArticlesV2(
      project, // PROJECT
      match, // MATCH
      sort, // SORT
      group, // GROUP
      limit, // LIMIT
      skip // SKIP
    ).subscribe(
      result => {
        this.loading = false;
        if (result && result[0] && result[0].items) {
          if(this.itemsPerPage === 0) {
            this.exportExcelComponent.items = result[0].items;
            this.exportExcelComponent.export();
            this.itemsPerPage = 10;
            this.getItems();
          } else {
            this.items = result[0].items;
            this.totalItems = result[0].count;
          }
        } else {
          this.items = new Array();
          this.totalItems = 0;
        }
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
        this.totalItems = 0;
      }
    );
  }

  public getValue(item, column): any {
    let val: string = 'item';
    let exists: boolean = true;
    let value: any = '';
    for(let a of column.name.split('.')) {
      val += '.'+a;
      if(exists && !eval(val)) {
        exists = false;
      }
    }
    if(exists) {
      switch(column.datatype) {
        case 'number':
          value = this.roundNumberPipe.transform(eval(val));
          break;
        case 'currency':
            value = this.currencyPipe.transform(this.roundNumberPipe.transform(eval(val)), 'USD', 'symbol-narrow', '1.2-2');
          break;
        default:
            value = eval(val);
          break;
      }
    }
    return value;
  }

  public pageChange(page): void {
      this.currentPage = page;
      this.getItems();
  }

  public selectItem(itemSelected: Article): void {
    this.activeModal.close({ item: itemSelected });
  }

  public orderBy(term: string): void {

    if (this.orderTerm[0] === term) {
      this.orderTerm[0] = "-" + term;
    } else {
      this.orderTerm[0] = term;
    }

    this.getItems();
  }

  public refresh(): void {
    this.getItems();
  }

  async openModal(op: string, item?: Article) {

    let modalRef;
    switch (op) {
      case 'view':
        modalRef = this._modalService.open(AddArticleComponent, { size: 'lg', backdrop: 'static' });
        modalRef.componentInstance.articleId = item._id;
        modalRef.componentInstance.readonly = true;
        modalRef.componentInstance.operation = "view";
        break;
      case 'add':
        modalRef = this._modalService.open(AddArticleComponent, { size: 'lg', backdrop: 'static' });
        modalRef.componentInstance.operation = "add";
        modalRef.result.then((result) => {
          this.getItems();
        }, (reason) => {
          this.getItems();
        });
        break;
      case 'update':
        modalRef = this._modalService.open(AddArticleComponent, { size: 'lg', backdrop: 'static' });
        modalRef.componentInstance.articleId = item._id;
        modalRef.componentInstance.operation = "update";
        modalRef.result.then((result) => {
          this.getItems();
        }, (reason) => {
          this.getItems();
        });
        break;
      case 'delete':
        modalRef = this._modalService.open(DeleteArticleComponent, { size: 'lg', backdrop: 'static' });
        modalRef.componentInstance.article = item;
        modalRef.componentInstance.readonly = true;
        modalRef.result.then((result) => {
          if (result === 'delete_close') {
            this.getItems();
          }
        }, (reason) => {

        });
        break;
        case 'import':
        modalRef = this._modalService.open(ImportComponent, { size: 'lg', backdrop: 'static' });
        let model: any = new Article();
        model.model = "article";
        model.primaryKey = "code";
        model.type = '';
        model.description = '';
        model.basePrice = '';
        model.costPrice = '';
        model.markupPercentage = '';
        model.markupPrice = '';
        model.salePrice = '';
        model.barcode = '';
        model.allowPurchase = '';
        model.allowSale = '';
        model.allowSaleWithoutStock = '';
        model.isWeigth = '';
        model.relations = new Array();
        model.relations.push("make_relation_description");
        model.relations.push("category_relation_description");
        model.relations.push("providers_relation_code");
        model.relations.push("currency_relation_code");
        model.relations.push("currency_relation_code");
        modalRef.componentInstance.model = model;
        modalRef.result.then((result) => {
          if (result === 'import_close') {
            this.getItems();
          }
        }, (reason) => {

        });
        break;
      case 'print-label':

        await this.getPrinters().then(
          printers => {
            let labelPrinter: Printer;
            if (printers && printers.length > 0) {
              for (let printer of printers) {
                if (printer.printIn === PrinterPrintIn.Label) {
                  labelPrinter = printer;
                }
              }
            }

            if(labelPrinter) {
              modalRef = this._modalService.open(PrintLabelComponent);
              if(item) {
                modalRef.componentInstance.article = item;
              } else {
                modalRef.componentInstance.articles = this.items;
              }
              modalRef.componentInstance.typePrint = 'label';
              modalRef.componentInstance.printer = labelPrinter;
            } else {
              this.showMessage('Debe definir un modelo de impresora como etiqueta en el menu Configuración->Impresoras', "info", true);
            }
          }
        );
        break;
      case 'print-list':
        modalRef = this._modalService.open(PrintPriceListComponent);
        modalRef.result.then((result) => {
          this.getItems();
        }, (reason) => {
          this.getItems();
        });
        break;
      case 'update-prices':
        modalRef = this._modalService.open(UpdateArticlePriceComponent);
        modalRef.componentInstance.operation = "update-prices";
        modalRef.result.then((result) => {
          this.getItems();
        }, (reason) => {
          this.getItems();
        });
        break;
      case 'copy':
        modalRef = this._modalService.open(AddArticleComponent, { size: 'lg', backdrop: 'static' });
        modalRef.componentInstance.operation = "copy";
        modalRef.componentInstance.articleId = item._id
        modalRef.result.then((result) => {
          this.getItems();
        }, (reason) => {
          this.getItems();
        });
        break;
      default: ;
    }
  };

  public getPrinters(): Promise<Printer[]> {

    return new Promise<Printer[]>( async (resolve, reject) => {

      this.loading = true;

      this._printerService.getPrinters().subscribe(
        result => {
          this.loading = false;
          if (!result.printers) {
            if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
            resolve(null);
          } else {
            resolve(result.printers);
          }
        },
        error => {
          this.loading = false;
          this.showMessage(error._body, 'danger', false);
          resolve(null);
        }
      );
    });
  }

  public exportItems(): void {
    this.itemsPerPage = 0;
    this.getItems();
  }

  public getTaxes(query?: string): Promise<Tax[]> {

    return new Promise<Tax[]> ((resolve, reject) => {

      this._taxService.getTaxes(query).subscribe(
        result => {
          if (!result.taxes) {
            if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
            resolve(null);
          } else {
            resolve(result.taxes);
          }
        },
        error => {
          this.showMessage(error._body, 'danger', false);
          resolve(null);
        }
      );
    });
  }

  public getItem(itemId: string): Promise<Article> {

    return new Promise<Article> ((resolve, reject) => {

      this._articleService.getArticle(itemId).subscribe(
        result => {
          if (!result.article) {
            if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
            resolve(null);
          } else {
            resolve(result.article);
          }
        },
        error => {
          this.showMessage(error._body, 'danger', false);
          resolve(null);
        }
      );
    });
  }

  public padNumber(n, length) {
    var n = n.toString();
    while (n.length < length)
        n = "0" + n;
    return n;
  }

  public saveClaim(titulo: string, message: string): void {
    
    this.loading = true;

    let claim: Claim = new Claim();
    claim.description = message;
    claim.name = titulo;
    claim.priority = ClaimPriority.High;
    claim.type = ClaimType.Err;
    claim.listName = 'ERRORES 500';

    this._claimService.saveClaim(claim).subscribe();
  }

  public showMessage(message: string, type: string, dismissible: boolean): void {
    this.alertMessage = message;
    this.alertConfig.type = type;
    this.alertConfig.dismissible = dismissible;
  }

  public hideMessage(): void {
    this.alertMessage = '';
  }
}