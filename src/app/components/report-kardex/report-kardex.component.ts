import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbAlertConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Article } from 'app/components/article/article';
import { MovementOfArticle } from 'app/components/movement-of-article/movement-of-article';
import { ExportExcelComponent } from '../export/export-excel/export-excel.component';

import * as moment from 'moment';
import 'moment/locale/es';

import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { CurrencyPipe } from '@angular/common';
import { Config } from 'app/app.config';
import { ArticleStockService } from 'app/components/article-stock/article-stock.service';
import { ArticleService } from 'app/components/article/article.service';
import { Branch } from 'app/components/branch/branch';
import { BranchService } from 'app/components/branch/branch.service';
import { Deposit } from 'app/components/deposit/deposit';
import { DepositService } from 'app/components/deposit/deposit.service';
import { AuthService } from 'app/components/login/auth.service';
import { MovementOfArticleService } from 'app/components/movement-of-article/movement-of-article.service';
import { RoundNumberPipe } from 'app/core/pipes/round-number.pipe';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { ArticleStock } from '../article-stock/article-stock';
import { ListArticlesComponent } from '../article/list-articles/list-articles.component';
import { TransactionState } from '../transaction/transaction';
import { ViewTransactionComponent } from '../transaction/view-transaction/view-transaction.component';

@Component({
  selector: 'app-report-kardex',
  templateUrl: './report-kardex.component.html',
  styleUrls: ['./report-kardex.component.scss'],
})
export class ReportKardexComponent implements OnInit {
  public articleSelected: Article;
  public articleSelectedId: string;
  public alertMessage: string = '';
  public loading: boolean = false;
  public roundNumber: RoundNumberPipe;
  @Input() branchSelectedId: string;
  public allowChangeBranch: boolean;
  public branches: Branch[];
  @Input() depositSelectedId: string;
  public deposits: Deposit[];
  private subscription: Subscription = new Subscription();

  public title = 'Kardex de Producto';
  public columns: any[];
  @ViewChild(ExportExcelComponent) exportExcelComponent: ExportExcelComponent;
  public orderTerm: string[] = ['transaction.endDate'];
  public currentPage: number = 1;
  public itemsPerPage = 5;
  public totalItems = 0;
  public items: any[];
  public balance: number = 0;
  public sort = { endDate: -1 };
  private roundNumberPipe: RoundNumberPipe = new RoundNumberPipe();
  private currencyPipe: CurrencyPipe = new CurrencyPipe('es-Ar');
  public pathLocation: string[];
  public filters: any[];
  public filterValue: string;
  public startDate: string;
  public endDate: string;
  public timezone: string = '-03:00';
  public articleStockId: string;

  constructor(
    public _movementOfArticleService: MovementOfArticleService,
    public _articleStockService: ArticleStockService,
    private _toastr: ToastrService,
    private _articleService: ArticleService,
    public _router: Router,
    private _route: ActivatedRoute,
    public _modalService: NgbModal,
    public alertConfig: NgbAlertConfig,
    private _branchService: BranchService,
    private _depositService: DepositService,
    private _authService: AuthService
  ) {
    this.roundNumber = new RoundNumberPipe();
    this.items = new Array();
    this.startDate = moment('1990-01-01').format('YYYY-MM-DD');
    this.endDate = moment().format('YYYY-MM-DD');

    this.changeColumns();
    this.processParams();

    this.filters = new Array();
    for (let field of this.columns) {
      if (field.defaultFilter) {
        this.filters[field.name] = field.defaultFilter;
      } else {
        this.filters[field.name] = '';
      }
    }
  }

  public changeColumns() {
    this.columns = [
      {
        name: 'transaction.endDate',
        visible: true,
        disabled: false,
        filter: false,
        project: null,
        datatype: 'date',
        align: 'left',
        required: false,
      },
      {
        name: 'transaction.type.transactionMovement',
        visible: true,
        disabled: false,
        filter: true,
        project: null,
        datatype: 'string',
        align: 'left',
        required: false,
      },
      {
        name: 'transaction.type.name',
        visible: true,
        disabled: false,
        filter: true,
        project: null,
        datatype: 'string',
        align: 'left',
        required: false,
      },
      {
        name: 'transaction.number',
        visible: true,
        disabled: false,
        filter: true,
        project: null,
        datatype: 'number',
        align: 'right',
        required: false,
      },
      {
        name: 'transaction.company.name',
        visible: false,
        disabled: false,
        filter: true,
        project: null,
        datatype: 'string',
        align: 'left',
        required: false,
      },
      {
        name: 'quantityForStock',
        visible: true,
        disabled: true,
        filter: false,
        project: '1',
        datatype: 'number',
        align: 'right',
        required: false,
      },
      {
        name: 'Stock',
        visible: true,
        disabled: true,
        filter: false,
        project: null,
        datatype: 'number',
        align: 'right',
        required: false,
      },
      {
        name: 'description',
        visible: false,
        disabled: false,
        filter: true,
        project: null,
        datatype: 'string',
        align: 'left',
        required: false,
      },
      {
        name: 'amount',
        visible: false,
        disabled: false,
        filter: true,
        project: null,
        datatype: 'number',
        align: 'right',
        required: false,
      },
      {
        name: 'basePrice',
        visible: false,
        disabled: false,
        filter: true,
        project: null,
        datatype: 'currency',
        align: 'right',
        required: false,
      },
      {
        name: 'costPrice',
        visible: false,
        disabled: false,
        filter: true,
        project: null,
        datatype: 'currency',
        align: 'right',
        required: false,
      },
      {
        name: 'unitPrice',
        visible: false,
        disabled: false,
        filter: true,
        project: null,
        datatype: 'currency',
        align: 'right',
        required: false,
      },
      {
        name: 'markupPercentage',
        visible: false,
        disabled: false,
        filter: true,
        project: null,
        datatype: 'percent',
        align: 'right',
        required: false,
      },
      {
        name: 'markupPrice',
        visible: false,
        disabled: false,
        filter: true,
        project: null,
        datatype: 'currency',
        align: 'right',
        required: false,
      },
      {
        name: 'salePrice',
        visible: false,
        disabled: false,
        filter: true,
        project: null,
        datatype: 'currency',
        align: 'left',
        required: false,
      },
      {
        name: 'operationType',
        visible: false,
        disabled: true,
        filter: false,
        datatype: 'string',
        project: null,
        defaultFilter: `{ "$ne": "D" }`,
        align: 'left',
        required: true,
      },
      {
        name: 'transaction.operationType',
        visible: false,
        disabled: true,
        filter: false,
        defaultFilter: `{ "$ne": "D" }`,
        project: null,
        datatype: 'string',
        align: 'left',
        required: true,
      },
      {
        name: 'transaction.state',
        visible: false,
        disabled: true,
        filter: false,
        project: null,
        datatype: 'string',
        align: 'left',
        required: true,
      },
      {
        name: 'transaction._id',
        visible: false,
        disabled: true,
        filter: true,
        project: null,
        datatype: 'string',
        align: 'left',
        required: true,
      },
      {
        name: 'article._id',
        visible: false,
        disabled: true,
        filter: true,
        project: null,
        datatype: 'string',
        align: 'left',
        required: true,
      },
      {
        name: 'deposit._id',
        visible: false,
        disabled: true,
        filter: false,
        project: null,
        datatype: 'string',
        align: 'left',
        required: true,
      },
      {
        name: 'endDate',
        visible: false,
        disabled: true,
        filter: false,
        datatype: 'string',
        project: '"$transaction.endDate"',
        align: 'left',
        required: true,
      },
      {
        name: 'modifyStock',
        visible: false,
        disabled: true,
        filter: true,
        datatype: 'boolean',
        project: null,
        align: 'left',
        required: true,
      },
    ];
  }

  private processParams(): void {
    this._route.queryParams.subscribe((params) => {
      if (params['article']) this.articleSelectedId = params['article'];
      if (params['branch']) this.branchSelectedId = params['branch'];
      if (params['deposit']) this.depositSelectedId = params['deposit'];
      if (params['aricleStock']) this.articleStockId = params['articleStock'];
    });
  }

  async ngOnInit() {
    if (Config.timezone && Config.timezone !== '') {
      this.timezone = Config.timezone.split('UTC')[1];
    }

    if (!this.branchSelectedId) {
      await this.getBranches({ operationType: { $ne: 'D' } }).then(
        async (branches) => {
          this.branches = branches;
          if (this.branches && this.branches.length > 1) {
            this.branchSelectedId = this.branches[0]._id;
          }
        }
      );
    } else {
      await this.getBranches({ operationType: { $ne: 'D' } }).then(
        async (branches) => {
          this.branches = branches;
          this.allowChangeBranch = true;
        }
      );
    }

    await this._authService.getIdentity.subscribe(async (identity) => {
      if (identity && identity.origin && identity.origin.branch) {
        this.allowChangeBranch = false;
        this.branchSelectedId = identity.origin.branch._id;
      } else {
        if (this.branchSelectedId) {
          this.allowChangeBranch = true;
        } else {
          this.branchSelectedId = null;
        }
      }
    });

    let r = await this.getDepositsByBranch();
    if (r) {
      if (this.articleSelectedId) {
        this.getArticle(this.articleSelectedId);
      } else {
        this.openModal('article');
      }
    } else {
      if (this.articleSelectedId) {
        this.getArticle(this.articleSelectedId);
      } else {
        this.openModal('article');
      }
    }
  }

  public drop(event: CdkDragDrop<string[]>): void {
    moveItemInArray(this.columns, event.previousIndex, event.currentIndex);
  }

  public exportItems(): void {
    this.exportExcelComponent.items = this.items;
    this.exportExcelComponent.export();
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

  public getBranches(match: {} = {}): Promise<Branch[]> {
    return new Promise<Branch[]>((resolve, reject) => {
      this._branchService
        .getBranches(
          {}, // PROJECT
          match, // MATCH
          { number: 1 }, // SORT
          {}, // GROUP
          0, // LIMIT
          0 // SKIP
        )
        .subscribe(
          (result) => {
            if (result && result.branches) {
              resolve(result.branches);
            } else {
              resolve(null);
            }
          },
          (error) => {
            this.showMessage(error._body, 'danger', false);
            resolve(null);
          }
        );
    });
  }

  public async getDepositsByBranch() {
    return new Promise(async (resolve, reject) => {
      if (this.branches && this.branches.length > 0) {
        if (!this.branchSelectedId)
          this.branchSelectedId = this.branches[0]._id;
        let query = {
          branch: { $oid: this.branchSelectedId },
          operationType: { $ne: 'D' },
        };
        await this.getDeposits(query).then((deposits) => {
          this.deposits = deposits;
          if (this.deposits && this.deposits.length > 0) {
            for (const deposit of this.deposits) {
              if (this.depositSelectedId === deposit._id) {
                this.depositSelectedId = deposit._id;
              } else {
                this.depositSelectedId = this.deposits[0]._id;
              }
            }
            resolve(true);
          } else {
            resolve(false);
          }
        });
      }
    });
  }

  public getDeposits(match: {} = {}): Promise<Deposit[]> {
    return new Promise<Deposit[]>((resolve, reject) => {
      this._depositService
        .getDepositsV2(
          {}, // PROJECT
          match, // MATCH
          { name: 1 }, // SORT
          {}, // GROUP
          0, // LIMIT
          0 // SKIP
        )
        .subscribe(
          (result) => {
            if (result && result.deposits) {
              resolve(result.deposits);
            } else {
              resolve(null);
            }
          },
          (error) => {
            this.showMessage(error._body, 'danger', false);
            resolve(null);
          }
        );
    });
  }

  public getArticle(id: string): void {
    this._articleService.getArticle(id).subscribe(
      (result) => {
        if (!result.article) {
          if (result.message && result.message !== '')
            this.showMessage(result.message, 'info', true);
        } else {
          this.articleSelected = result.article;
          this.getItems();
        }
      },
      (error) => {
        this.showMessage(error._body, 'danger', false);
      }
    );
  }

  public getItems(): void {
    this.loading = true;

    let timezone = '-03:00';
    if (Config.timezone && Config.timezone !== '') {
      timezone = Config.timezone.split('UTC')[1];
    }

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

    if (match.charAt(match.length - 1) === ',')
      match = match.substring(0, match.length - 1);

    match += `}`;

    match = JSON.parse(match);
    if (this.depositSelectedId)
      match['deposit._id'] = { $oid: this.depositSelectedId };
    match['endDate'] = {
      $gte: { $date: this.startDate + 'T00:00:00' + timezone },
      $lte: { $date: this.endDate + 'T23:59:59' + timezone },
    };
    match['article._id'] = { $oid: this.articleSelected._id };
    match['$and'] = [
      { 'transaction.state': { $ne: TransactionState.Open } },
      { 'transaction.state': { $ne: TransactionState.Pending } },
      { 'transaction.state': { $ne: TransactionState.Canceled } },
      { 'transaction.state': { $ne: TransactionState.PaymentDeclined } },
    ];

    // ARMAMOS EL PROJECT SEGÚN DISPLAYCOLUMNS
    let project = `{`;
    let j = 0;
    for (let i = 0; i < this.columns.length; i++) {
      if (this.columns[i].visible || this.columns[i].required) {
        if (j > 0) {
          project += `,`;
        }
        j++;
        if (this.columns[i].project) {
          project += `"${this.columns[i].name}" : ${this.columns[i].project} `;
        } else {
          if (this.columns[i].datatype !== 'string') {
            if (this.columns[i].datatype === 'date') {
              project += `"${this.columns[i].name}": { "$dateToString": { "date": "$${this.columns[i].name}", "format": "%d/%m/%Y", "timezone": "${this.timezone}" }}`;
            } else {
              project += `"${this.columns[i].name}": { "$toString" : "$${this.columns[i].name}" }`;
            }
          } else {
            project += `"${this.columns[i].name}": 1`;
          }
        }
      }
    }
    project += `}`;
    project = JSON.parse(project);

    // AGRUPAMOS EL RESULTADO
    let group = {
      _id: null,
      count: { $sum: 1 },
      balance: { $sum: '$quantityForStock' },
      items: { $push: '$$ROOT' },
    };

    let page = 0;
    if (this.currentPage != 0) {
      page = this.currentPage - 1;
    }
    let skip = !isNaN(page * this.itemsPerPage) ? page * this.itemsPerPage : 0; // SKIP
    let limit = 0;

    this.subscription.add(
      this._movementOfArticleService
        .getMovementsOfArticlesV2(
          project, // PROJECT
          match, // MATCH
          sort, // SORT
          group, // GROUP
          limit, // LIMIT
          skip // SKIP
        )
        .subscribe(
          (result) => {
            this.loading = false;
            if (result && result[0] && result[0].items) {
              this.items = result[0].items;
              this.totalItems = result[0].count;
              this.balance = result[0].balance;
              this.currentPage = parseFloat(
                this.roundNumber
                  .transform(this.totalItems / this.itemsPerPage + 0.5, 0)
                  .toFixed(0)
              );
              let stock = 0;
              for (let mov of this.items) {
                mov['Stock'] = stock + mov.quantityForStock;
                stock += mov.quantityForStock;
              }
            } else {
              this.items = new Array();
              this.totalItems = 0;
              this.currentPage = 0;
              this.balance = 0;
            }
          },
          (error) => {
            this.showMessage(error._body, 'danger', false);
            this.loading = false;
            this.totalItems = 0;
          }
        )
    );
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

  public refresh(): void {
    if (this.articleSelected) {
      this.getItems();
    } else {
      this.showMessage('Debe seleccionar un Producto', 'info', true);
    }
  }

  public openModal(op: string, movementOfArticle?: MovementOfArticle): void {
    let modalRef;
    switch (op) {
      case 'view-transaction':
        modalRef = this._modalService.open(ViewTransactionComponent, {
          size: 'lg',
          backdrop: 'static',
        });
        modalRef.componentInstance.transactionId =
          movementOfArticle.transaction._id;
        break;
      case 'article':
        modalRef = this._modalService.open(ListArticlesComponent, {
          size: 'lg',
          backdrop: 'static',
        });
        modalRef.componentInstance.userType = 'report';
        modalRef.result.then(
          (result) => {
            if (result.article) {
              this.articleSelected = result.article;
              this.getItems();
            }
          },
          (reason) => {}
        );
        break;
      default:
    }
  }

  public orderBy(term: string): void {
    if (this.sort[term]) {
      this.sort[term] *= -1;
    } else {
      this.sort = JSON.parse('{"' + term + '": 1 }');
    }

    this.getItems();
  }

  public pageChange(page): void {
    this.currentPage = page;
    this.getItems();
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  public repairStock() {
    this.loading = true;

    let query = `where= "article": "${this.articleSelected._id}",
                        "branch": "${this.branchSelectedId}",
                        "deposit": "${this.depositSelectedId}"`;

    this._articleStockService.getArticleStocks(query).subscribe(
      (result) => {
        if (!result.articleStocks || result.articleStocks.length <= 0) {
          let articleStock = new ArticleStock();
          articleStock.article = this.articleSelected;
          articleStock.branch = new Branch();
          articleStock.branch._id = this.branchSelectedId;
          articleStock.deposit = new Deposit();
          articleStock.deposit._id = this.depositSelectedId;
          articleStock.realStock = this.balance;
          this._articleStockService.saveArticleStock(articleStock).subscribe(
            (result) => {
              this.loading = false;
              if (result && result.articleStock) {
                this.showToast(
                  'El stock se actualizó correctamente.',
                  'success'
                );
              } else {
                if (result.message && result.message !== '')
                  this.showMessage(result.message, 'info', true);
              }
            },
            (error) => {
              this.showToast(error._body, 'danger');
              this.loading = false;
            }
          );
        } else {
          result.articleStocks[0].realStock = this.balance;
          this._articleStockService
            .updateArticleStock(result.articleStocks[0])
            .subscribe(
              (result) => {
                this.loading = false;
                if (result && result.articleStock) {
                  this.showToast(
                    'El stock se actualizó correctamente.',
                    'success'
                  );
                } else {
                  if (result.message && result.message !== '')
                    this.showMessage(result.message, 'info', true);
                }
              },
              (error) => {
                this.showToast(error._body, 'danger');
                this.loading = false;
              }
            );
        }
      },
      (error) => {
        this.showToast(error._body, 'danger');
        this.loading = false;
      }
    );
  }

  public showMessage(
    message: string,
    type: string,
    dismissible: boolean
  ): void {
    this.alertMessage = message;
    this.alertConfig.type = type;
    this.alertConfig.dismissible = dismissible;
  }

  public hideMessage(): void {
    this.alertMessage = '';
  }

  public showToast(message: string, type: string = 'success'): void {
    switch (type) {
      case 'success':
        this._toastr.success('', message);
        break;
      case 'info':
        this._toastr.info('', message);
        break;
      case 'warning':
        this._toastr.warning('', message);
        break;
      case 'danger':
        this._toastr.error('', message);
        break;
      default:
        this._toastr.success('', message);
        break;
    }
  }
}
