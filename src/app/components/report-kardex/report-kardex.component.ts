import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { MovementOfArticle } from 'app/models/movement-of-article';
import { Article } from 'app/models/article';
import { NgbModal, NgbAlertConfig } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { ExportExcelComponent } from '../export/export-excel/export-excel.component';

import * as moment from 'moment';
import 'moment/locale/es';

import { ArticleService } from 'app/services/article.service';
import { ListArticlesComponent } from '../list-articles/list-articles.component';
import { MovementOfArticleService } from 'app/services/movement-of-article.service';
import { ViewTransactionComponent } from '../view-transaction/view-transaction.component';
import { RoundNumberPipe } from 'app/pipes/round-number.pipe';
import { Branch } from 'app/models/branch';
import { BranchService } from 'app/services/branch.service';
import { attributes } from 'app/models/movement-of-article';
import { Config } from 'app/app.config';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { CurrencyPipe } from '@angular/common';
import { Deposit } from 'app/models/deposit';
import { DepositService } from 'app/services/deposit.service';
import { AuthService } from 'app/services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-report-kardex',
  templateUrl: './report-kardex.component.html',
  styleUrls: ['./report-kardex.component.scss']
})

export class ReportKardexComponent implements OnInit {

  public articleSelected: Article;
  public alertMessage: string = '';
  public loading: boolean = false;
  public roundNumber: RoundNumberPipe;
  @Input() branchSelectedId: String;
  public allowChangeBranch: boolean;
  public branches: Branch[];
  @Input() depositSelectedId: String;
  public deposits: Deposit[];
  private subscription: Subscription = new Subscription();

  public title = 'Kardex de Producto';
  public columns = attributes;
  @ViewChild(ExportExcelComponent, {static: false}) exportExcelComponent: ExportExcelComponent;
  public orderTerm: string[] = ['transaction.endDate'];
  public currentPage: number = 0;
  public itemsPerPage = 10;
  public totalItems = 0;
  public items: any[];
  public balance: number = 0;
  public sort = { "endDate": -1 };
  private roundNumberPipe: RoundNumberPipe = new RoundNumberPipe();
  private currencyPipe: CurrencyPipe = new CurrencyPipe('es-Ar');

  public filters: any[];
  public filterValue: string;
  public startDate: string;
  public endDate: string;
  public timezone: string = "-03:00";

  constructor(
    public _movementOfArticleService: MovementOfArticleService,
    private _articleService : ArticleService,
    public _router: Router,
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
    
    this.filters = new Array();
    for(let field of this.columns) {
      if(field.defaultFilter) {
        this.filters[field.name] = field.defaultFilter;
      } else {
        this.filters[field.name] = "";
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
        required : false
      },
      {
        name: 'transaction.type.transactionMovement',
        visible: true,
        disabled: false,
        filter: true,
    	  project: null,
        datatype: 'string',
        align: 'left',
        required : false,
      },
      {
        name: 'transaction.type.name',
        visible: true,
        disabled: false,
        filter: true,
    	  project: null,
        datatype: 'string',
        align: 'left',
        required : false,
      },
      {
        name: 'transaction.number',
        visible: true,
        disabled: false,
        filter: true,
    	  project: null,
        datatype: 'number',
        align: 'right',
        required : false,
      },
      {
        name: 'transaction.company.name',
        visible: false,
        disabled: false,
        filter: true,
		project: null,
        datatype: 'string',
        align: 'left',
        required : false,
      },
      {
        name: 'quantityForStock',
        visible: true,
        disabled: true,
        filter: false,
    	  project: null,
        datatype: 'number',
        align: 'right',
        required : false,
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
        required : false,
      },
      {
        name: 'amount',
        visible: false,
        disabled: false,
        filter: true,
    	  project: null,
        datatype: 'number',
        align: 'right',
        required : false,
      },
      {
        name: 'basePrice',
        visible: false,
        disabled: false,
        filter: true,
    	  project: null,
        datatype: 'currency',
        align: 'right',
        required : false,
      },
      {
        name: 'costPrice',
        visible: false,
        disabled: false,
        filter: true,
    	  project: null,
        datatype: 'currency',
        align: 'right',
        required : false,
      },
      {
        name: 'unitPrice',
        visible: false,
        disabled: false,
        filter: true,
    	  project: null,
        datatype: 'currency',
        align: 'right',
        required : false,
      },
      {
        name: 'markupPercentage',
        visible: false,
        disabled: false,
        filter: true,
    	  project: null,
        datatype: 'percent',
        align: 'right',
        required : false,
      },
      {
        name: 'markupPrice',
        visible: false,
        disabled: false,
        filter: true,
    	  project: null,
        datatype: 'currency',
        align: 'right',
        required : false,
      },
      {
        name: 'salePrice',
        visible: false,
        disabled: false,
        filter: true,
    	  project: null,
        datatype: 'currency',
        align: 'left',
        required : false,
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
        required : true,
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
        required : true,
      },
      {
        name: 'transaction._id',
        visible: false,
        disabled: true,
        filter: true,
    	  project: null,
        datatype: 'string',
        align: 'left',
        required : true,
      },
      {
        name: 'article._id',
        visible: false,
        disabled: true,
        filter: true,
    	  project: null,
        datatype: 'string',
        align: 'left',
        required : true,
      },
      {
        name: 'deposit._id',
        visible: false,
        disabled: true,
        filter: false,
    	  project: null,
        datatype: 'string',
        align: 'left',
        required : true,
      },
      {
        name: 'endDate',
        visible: false,
        disabled: true,
        filter: false,
        datatype: 'string',
        project: '"$transaction.endDate"',
        align: 'left',
        required : true
      },
      {
        name: 'modifyStock',
        visible: false,
        disabled: true,
        filter: true,
        datatype: 'boolean',
        project: null,
        align: 'left',
        required : true
      }
    ];
  }

  async ngOnInit() {

    if(Config.timezone && Config.timezone !== '') {
      this.timezone =  Config.timezone.split('UTC')[1];
    }

    if(!this.branchSelectedId) {
      await this.getBranches({ operationType: { $ne: 'D' } }).then(
        async branches => {
          this.branches = branches;
          if(this.branches && this.branches.length > 1) {
            this.branchSelectedId = this.branches[0]._id;
          }
        }
      );
      await this._authService.getIdentity.subscribe(
        async identity => {
          if(identity && identity.origin) {
            this.allowChangeBranch = false;
            this.branchSelectedId = identity.origin.branch._id;
          } else {
            this.allowChangeBranch = true;
            this.branchSelectedId = null;
          }
        }
      );
    }

    let pathLocation: string[] = this._router.url.split('/');

    if(!this.depositSelectedId) {
      let r = await this.getDepositsByBranch();
      if(r) {
        if(pathLocation[3] != ':id') {
          this.getArticle(pathLocation[3].toString());
        } else {
          this.openModal('article');
        }
      }
    } else {
      if(pathLocation[3] != ':id') {
        this.getArticle(pathLocation[3].toString());
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
  
      this._branchService.getBranches(
          {}, // PROJECT
          match, // MATCH
          { number: 1 }, // SORT
          {}, // GROUP
          0, // LIMIT
          0 // SKIP
      ).subscribe(
        result => {
          if (result && result.branches) {
            resolve(result.branches);
          } else {
            resolve(null);
          }
        },
        error => {
          this.showMessage(error._body, 'danger', false);
          resolve(null);
        }
      );
    });
  }

  public async getDepositsByBranch() {
    return new Promise(async (resolve, reject) => {
      if(this.branches && this.branches.length > 0) {
        if(!this.branchSelectedId) this.branchSelectedId = this.branches[0]._id;
        let query = { branch: { $oid: this.branchSelectedId }, operationType: { $ne: 'D' } };
        await this.getDeposits(query).then(
          deposits => {
            this.deposits = deposits;
            if(this.deposits && this.deposits.length > 0) {
              this.depositSelectedId = this.deposits[0]._id;
              resolve(true);
            } else {
              resolve(false);
            }
          }
        );
      }
    });
  }

  public getDeposits(match: {} = {}): Promise<Deposit[]> {

    return new Promise<Deposit[]>((resolve, reject) => {
  
      this._depositService.getDepositsV2(
          {}, // PROJECT
          match, // MATCH
          { name: 1 }, // SORT
          {}, // GROUP
          0, // LIMIT
          0 // SKIP
      ).subscribe(
        result => {
          if (result && result.deposits) {
            resolve(result.deposits);
          } else {
            resolve(null);
          }
        },
        error => {
          this.showMessage(error._body, 'danger', false);
          resolve(null);
        }
      );
    });
  }

  public getArticle( id : string) : void {
    
    this._articleService.getArticle(id).subscribe(
      result => {
        if (!result.article) {
          if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
        } else {
          this.articleSelected = result.article;
          this.getItems();
        }
      },
      error => {
        this.showMessage(error._body, 'danger', false);
      }
    );
  }

  public getItems(): void {

    this.loading = true;

    let timezone = "-03:00";
    if(Config.timezone && Config.timezone !== '') {
      timezone =  Config.timezone.split('UTC')[1];
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
      for(let i = 0; i < this.columns.length; i++) {
        if(this.columns[i].visible || this.columns[i].required) {
          let value = this.filters[this.columns[i].name];
          if (value && value != "" && value !== {}) {
            if(this.columns[i].defaultFilter) {
              match += `"${this.columns[i].name}": ${this.columns[i].defaultFilter}`;
            } else {
              match += `"${this.columns[i].name}": { "$regex": "${value}", "$options": "i"}`;
            }
            if (i < this.columns.length - 1 ) {
              match += ',';
            }
          }
        }
      }

    if (match.charAt(match.length - 1) === ',') match = match.substring(0, match.length - 1);

    match += `}`;

    match = JSON.parse(match);
    if(this.depositSelectedId) match['deposit._id'] = { $oid: this.depositSelectedId };
    match['endDate'] = { $gte: { $date: this.startDate + 'T00:00:00' + timezone }, $lte: { $date: this.endDate +'T23:59:59' + timezone } };
    match['article._id'] = { $oid: this.articleSelected._id };

    // ARMAMOS EL PROJECT SEGÚN DISPLAYCOLUMNS
    let project = `{`;
    let j = 0;
    for(let i = 0; i < this.columns.length; i++) {
      if(this.columns[i].visible || this.columns[i].required) {
        if(j > 0) {
          project += `,`;
        }
        j++;
        if(this.columns[i].project) {
          project += `"${this.columns[i].name}" : ${this.columns[i].project} `
        } else {
          if(this.columns[i].datatype !== "string") {
            if(this.columns[i].datatype === "date") {
              project += `"${this.columns[i].name}": { "$dateToString": { "date": "$${this.columns[i].name}", "format": "%d/%m/%Y", "timezone": "${this.timezone}" }}`
            } else {
              project += `"${this.columns[i].name}": { "$toString" : "$${this.columns[i].name}" }`
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

    this.subscription.add(this._movementOfArticleService.getMovementsOfArticlesV2(
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
          if(this.currentPage == 0 && this.totalItems > this.itemsPerPage) this.currentPage = parseFloat(this.roundNumber.transform(this.totalItems / this.itemsPerPage + 0.5, 0).toFixed(0));
          this.balance = 0;
          for(let mov of this.items) {
            this.balance += parseFloat(mov.quantityForStock);
            mov['Stock'] = this.balance;
          }
        } else {
          this.items = new Array();
          this.totalItems = 0;
          this.currentPage = 0;
          this.balance = 0;
        }
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
        this.totalItems = 0;
      }
    ));
  }

  public getColumnsVisibles(): number {
    let count: number = 0;
    for (let column of this.columns) {
      if(column.visible) {
        count++;
      }
    }
    return count;
  }

  public refresh(): void {

    if (this.articleSelected) {
      this.getItems();;
    } else {
      this.showMessage("Debe seleccionar un Producto", 'info', true);
    }
  }

  public openModal(op: string, movementOfArticle?: MovementOfArticle): void {

    let modalRef;
    switch (op) {
      case 'view-transaction':
        modalRef = this._modalService.open(ViewTransactionComponent, { size: 'lg', backdrop: 'static' });
        modalRef.componentInstance.transactionId = movementOfArticle.transaction._id;
        break;
      case 'article':
        modalRef = this._modalService.open(ListArticlesComponent, { size: 'lg', backdrop: 'static' });
        modalRef.componentInstance.userType = 'kardex';
        modalRef.result.then(
          (result) => {
            if (result.article) {
              this.articleSelected = result.article;
              this.getItems();;
            }
          }, (reason) => {
          }
        );
        break;
      default: ;
    }
  }

  public orderBy(term: string): void {

    if(this.sort[term]) {
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

  public showMessage(message: string, type: string, dismissible: boolean): void {
    this.alertMessage = message;
    this.alertConfig.type = type;
    this.alertConfig.dismissible = dismissible;
  }

  public hideMessage(): void {
    this.alertMessage = '';
  }
}
