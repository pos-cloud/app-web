import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { CurrencyPipe } from '@angular/common';
import { Component, EventEmitter, OnInit, Output, ViewChild, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { NgbAlertConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Branch } from 'app/components/branch/branch';
import { Deposit } from 'app/components/deposit/deposit';
import { PriceList } from 'app/components/price-list/price-list';
import { BranchService } from 'app/core/services/branch.service';
import { DepositService } from 'app/core/services/deposit.service';
import { PriceListService } from 'app/core/services/price-list.service';
import { RoundNumberPipe } from 'app/shared/pipes/round-number.pipe';
import { Subscription } from 'rxjs';

import { Config } from '../../../app.config';
import { ArticleStockService } from '../../../core/services/article-stock.service';
import { PrinterService } from '../../../core/services/printer.service';
import { ExportExcelComponent } from '../../export/export-excel/export-excel.component';
import { PrintArticlesStockComponent } from '../../print/print-articles-stock/print-articles-stock.component';
import { Printer } from '../../printer/printer';
import { ArticleStock, attributes } from '../article-stock';
import { UpdateArticleStockComponent } from '../update-article-stock/update-article-stock.component';

import { ApiResponse } from '@types';
import { PrintLabelComponent } from 'app/components/article/actions/print-label/print-label.component';
import { ImportComponent } from 'app/shared/components/import/import.component';
import { ToastService } from 'app/shared/components/toast/toast.service';
import { AddArticleStockComponent } from '../article-stock/add-article-stock.component';

@Component({
  selector: 'app-list-article-stocks',
  templateUrl: './list-article-stocks.component.html',
  styleUrls: ['./list-article-stocks.component.scss'],
  providers: [NgbAlertConfig],
  encapsulation: ViewEncapsulation.None,
})
export class ListArticleStocksComponent implements OnInit {
  @ViewChild(ExportExcelComponent) exportExcelComponent: ExportExcelComponent;
  @Output() eventAddItem: EventEmitter<ArticleStock> = new EventEmitter<ArticleStock>();

  private subscription: Subscription = new Subscription();
  private roundNumberPipe: RoundNumberPipe = new RoundNumberPipe();
  private currencyPipe: CurrencyPipe = new CurrencyPipe('es-Ar');

  listTitle: string;
  orderTerm: string[] = ['-realStock'];
  totalItems: number = 0;
  items: any[] = new Array();
  itemsPerPage = 10;
  currentPage: number = 1;
  sort = { realStock: -1 };
  columns = attributes;
  title = 'Inventario';
  articleStocks: ArticleStock[] = new Array();
  priceLists: PriceList[] = new Array();
  branches: Branch[] = new Array();
  branchesSelected: Branch[] = new Array();
  deposits: Deposit[] = new Array();
  allDeposits: Deposit[] = new Array();
  depositsSelected: Deposit[] = new Array();
  priceListId: string;
  alertMessage: string = '';
  userType: string;
  propertyTerm: string;
  areFiltersVisible: boolean = false;
  loading: boolean = false;
  printers: Printer[];
  database: string;

  totalRealStock = 0;
  totalCost = 0;
  totalTotal = 0;

  filters: any[];
  filterValue: string;

  dropdownSettings = {
    singleSelection: true,
    defaultOpen: false,
    idField: '_id',
    textField: 'name',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    enableCheckAll: true,
    itemsShowLimit: 3,
    allowSearchFilter: true,
  };

  constructor(
    private _articleStockService: ArticleStockService,
    private _priceList: PriceListService,
    private _router: Router,
    private _toastService: ToastService,
    private _printerService: PrinterService,
    private _branchService: BranchService,
    private _depositService: DepositService,
    private _modalService: NgbModal,
    public alertConfig: NgbAlertConfig
  ) {
    this.filters = new Array();
    for (let field of this.columns) {
      if (field.defaultFilter) {
        this.filters[field.name] = field.defaultFilter;
      } else {
        this.filters[field.name] = '';
      }
    }
  }

  ngOnInit(): void {
    this.database = Config.database;

    this.getPriceList();
    let pathLocation: string[] = this._router.url.split('/');

    this.userType = pathLocation[1];
    this.getBranches();
  }

  refresh(): void {
    this.getItems();
  }

  drop(event: CdkDragDrop<string[]>): void {
    moveItemInArray(this.columns, event.previousIndex, event.currentIndex);
  }

  exportItems(): void {
    this.itemsPerPage = 0;
    this.getItems();
  }

  onBranchSelect(branch: Branch) {
    this.depositsSelected = new Array();
    this.getDeposits(branch._id);
  }

  getItems(): void {
    try {
      this.loading = true;

      if (this.branchesSelected.length === 0) {
        throw new Error('Debe seleccionar una sucursal.');
      }

      if (this.depositsSelected.length === 0) {
        throw new Error('Debe seleccionar un depósito.');
      }

      // FILTRAMOS LA CONSULTA
      let match = `{`;

      for (let i = 0; i < this.columns.length; i++) {
        if (this.columns[i].visible || this.columns[i].required) {
          let value = this.filters[this.columns[i].name];

          if (value && value != '') {
            if (this.columns[i].defaultFilter) {
              match += `"${this.columns[i].name}": ${this.columns[i].defaultFilter}`;
            } else {
              match += `"${this.columns[i].name}": { "$regex": "${value}", "$options": "i"}`;
            }
            if (i < this.columns.length - 1) {
              match += ',';
            }
          }
        }
      }

      if (match.charAt(match.length - 1) === ',') match = match.substring(0, match.length - 1);

      match += `}`;

      match = JSON.parse(match);

      let branchesAux = [];

      if (this.branchesSelected && this.branchesSelected.length > 0) {
        this.branchesSelected.forEach((branch) => {
          branchesAux.push({ $oid: branch._id });
        });
        match['branch'] = { $in: branchesAux };
      }

      let depositsAux = [];

      if (this.depositsSelected && this.depositsSelected.length > 0) {
        this.depositsSelected.forEach((deposit) => {
          depositsAux.push({ $oid: deposit._id });
        });
        match['deposit'] = { $in: depositsAux };
      }

      // ARMAMOS EL PROJECT SEGÚN DISPLAYCOLUMNS
      let project = `{`;
      let j = 0;

      for (let i = 0; i < this.columns.length; i++) {
        if (this.columns[i].visible || this.columns[i].required) {
          if (j > 0) {
            project += `,`;
          }
          j++;
          if (this.columns[i].project === null) {
            project += `"${this.columns[i].name}": 1`;
          } else {
            project += `"${this.columns[i].name}": ${this.columns[i].project}`;
          }
        }
      }
      project += `}`;

      project = JSON.parse(project);

      // AGRUPAMOS EL RESULTADO
      let group = {
        _id: null,
        count: { $sum: 1 },
        items: { $push: '$$ROOT' },
      };

      let page = 0;

      if (this.currentPage != 0) {
        page = this.currentPage - 1;
      }
      let skip = !isNaN(page * this.itemsPerPage) ? page * this.itemsPerPage : 0; // SKIP
      let limit = this.itemsPerPage;

      this.subscription.add(
        this._articleStockService
          .getArticleStocksV2(
            project, // PROJECT
            match, // MATCH
            this.sort, // SORT
            group, // GROUP
            limit, // LIMIT
            skip // SKIP
          )
          .subscribe(
            (result) => {
              this.loading = false;
              if (result && result[0] && result[0].items) {
                if (this.itemsPerPage === 0) {
                  this.exportExcelComponent.items = result[0].items;
                  this.exportExcelComponent.export();
                  this.itemsPerPage = 10;
                  this.getItems();
                } else {
                  this.items = result[0].items;
                  this.totalItems = result[0].count;
                  this.getSum();
                }
              } else {
                this.items = new Array();
                this.totalItems = 0;
              }
            },
            (error) => {
              this.showMessage(error._body, 'danger', false);
              this.loading = false;
              this.totalItems = 0;
            }
          )
      );
    } catch (error) {
      this._toastService.showToast({ message: error, type: 'danger' });
    }
  }

  public getSum(): any {
    let total = 0;

    this.columns.forEach((elementC) => {
      if (elementC.datatype === 'number' || elementC.datatype === 'currency') {
        this.items.forEach((elementI) => {
          Object.keys(elementI).forEach((elementK) => {
            if (elementK === elementC.name) {
              total = total + elementI[elementK];
            }
          });
        });
      }
      elementC['sum'] = total;
      total = 0;
    });
  }

  public getValue(item, column): any {
    let val: string = 'item';
    let exists: boolean = true;
    let value: any = '';

    for (let a of column.name.split('.')) {
      val += '.' + a;
      if (exists && !eval(val)) {
        exists = false;
      }
    }
    if (exists) {
      switch (column.datatype) {
        case 'number':
          value = this.roundNumberPipe.transform(eval(val));
          break;
        case 'currency':
          value = this.currencyPipe.transform(
            this.roundNumberPipe.transform(eval(val)),
            'USD',
            'symbol-narrow',
            '1.2-2'
          );
          break;
        case 'percent':
          value = this.roundNumberPipe.transform(eval(val)) + '%';
          break;
        default:
          value = eval(val);
          break;
      }
    }

    return value;
  }

  public getColumnsVisibles(): number {
    let count: number = 0;

    for (let column of this.columns) {
      if (column.visible) {
        count++;
      }
    }

    return count;
  }

  async openModal(op: string, articleStock: ArticleStock) {
    let modalRef;

    switch (op) {
      case 'view':
        window.open(
          `/#/report/kardex-de-productos/?article=${articleStock.article._id}&branch=${this.branchesSelected[0]._id}&deposit=${this.depositsSelected[0]._id}`,
          '_blank'
        );
        break;
      case 'add':
        modalRef = this._modalService.open(AddArticleStockComponent, { size: 'lg', backdrop: 'static' }).result.then(
          (result) => {
            this.getItems();
          },
          (reason) => {
            this.getItems();
          }
        );
        break;
      case 'update':
        modalRef = this._modalService.open(UpdateArticleStockComponent, {
          size: 'lg',
          backdrop: 'static',
        });
        modalRef.componentInstance.articleStock = articleStock;
        modalRef.componentInstance.readonly = false;
        modalRef.result.then(
          (result) => {
            if (result === 'save_close') {
              this.getItems();
            }
          },
          (reason) => {}
        );
        break;
      case 'print-label':
        const printLabelComponent = new PrintLabelComponent(this._printerService, this.alertConfig);
        printLabelComponent.articleId = articleStock.article._id;
        printLabelComponent.quantity = articleStock.realStock;
        printLabelComponent.ngOnInit();
        break;
      case 'price-lists':
        const printLabelComponent2 = new PrintLabelComponent(this._printerService, this.alertConfig);
        printLabelComponent2.articleId = articleStock.article._id;
        printLabelComponent.quantity = articleStock.realStock;
        printLabelComponent2.ngOnInit();
        break;
      case 'print-inventario':
        modalRef = this._modalService.open(PrintArticlesStockComponent);
        modalRef.componentInstance.branch = this.filters['branch.number'];
        modalRef.componentInstance.deposit = this.filters['deposit.name'];
        modalRef.componentInstance.make = this.filters['article.make.description'];
        modalRef.componentInstance.category = this.filters['article.category.description'];
        modalRef.componentInstance.code = this.filters['article.code'];
        modalRef.componentInstance.barcode = this.filters['article.barcode'];
        modalRef.componentInstance.description = this.filters['article.description'];
        break;
      case 'updateArticle':
        this.loading = true;
        this._articleStockService.updateArticle().subscribe(
          (result) => {
            if (result && result.message) {
              this._toastService.showToast(result.message, 'success');
              this.loading = false;
            }
          },
          (error) => {
            this._toastService.showToast(error._body, 'danger');
            this.loading = false;
            this.totalItems = 0;
          }
        );
        break;
      case 'uploadFile':
        modalRef = this._modalService.open(ImportComponent, {
          size: 'lg',
          backdrop: 'static',
        });
        modalRef.componentInstance.model = 'articles-stock';
        modalRef.componentInstance.branches = this.branches;
        modalRef.componentInstance.allDeposits = this.allDeposits;
        modalRef.componentInstance.title = 'Importar stock';
        modalRef.result.then(
          (result) => {
            if (result === 'save_close') {
              this.getItems();
            }
          },
          (reason) => {}
        );

        break;
      default:
        break;
    }
  }

  public addItem(articleStockSelected) {
    this.eventAddItem.emit(articleStockSelected);
  }

  public pageChange(page): void {
    this.currentPage = page;
    this.getItems();
  }

  public orderBy(term: string): void {
    if (this.sort[term]) {
      this.sort[term] *= -1;
    } else {
      this.sort = JSON.parse('{"' + term + '": 1 }');
    }

    this.getItems();
  }

  public getPrinters(): Promise<Printer[]> {
    return new Promise<Printer[]>(async (resolve, reject) => {
      this.loading = true;

      this._printerService.getPrinters().subscribe(
        (result) => {
          this.loading = false;
          if (!result.printers) {
            if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
            resolve(null);
          } else {
            resolve(result.printers);
          }
        },
        (error) => {
          this.loading = false;
          this.showMessage(error._body, 'danger', false);
          resolve(null);
        }
      );
    });
  }

  public getPriceList(): void {
    this._priceList.getPriceLists().subscribe(
      (result) => {
        if (result && result.priceLists) {
          this.priceLists = result.priceLists;
        } else {
          this.priceLists = new Array();
        }
      },
      (error) => {
        this.showMessage(error._body, 'danger', false);
      }
    );
  }

  public getBranches(): void {
    this._branchService.getAll({ match: { operationType: { $ne: 'D' } } }).subscribe(
      (result: ApiResponse) => {
        if (result.status === 200) {
          this.branches = result.result;

          if (this.branches && this.branches.length > 0) {
            this.branches.forEach((branch) => {
              this.getDeposits(branch._id);
            });
          }
        }
      },
      (error) => this._toastService.showToast(error)
    );
  }

  public getDeposits(branchId: string): void {
    this._depositService
      .getAll({
        match: { branch: { $oid: branchId }, operationType: { $ne: 'D' } },
      })
      .subscribe(
        (result: ApiResponse) => {
          if (result.status === 200) {
            const depositsForBranch = result.result;
            this.deposits = depositsForBranch;
            this.allDeposits = this.allDeposits.concat(depositsForBranch);
          }
        },
        (error) => this._toastService.showToast(error)
      );
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
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
