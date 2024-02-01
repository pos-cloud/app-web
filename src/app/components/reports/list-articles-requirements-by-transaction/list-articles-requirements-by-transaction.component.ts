import { Component, OnInit } from '@angular/core';
import {CurrencyPipe} from '@angular/common';
import { Router } from '@angular/router';
import { moveItemInArray, CdkDragDrop } from '@angular/cdk/drag-drop';
import { of as observableOf, Observable, Subscription } from 'rxjs';
import { NgbModal, NgbAlertConfig } from '@ng-bootstrap/ng-bootstrap';
import { Branch } from 'app/components/branch/branch';
import { BranchService } from 'app/components/branch/branch.service';
import { attributes } from '../reports';
import { TransactionService } from 'app/components/transaction/transaction.service';
import {RoundNumberPipe} from '../../../main/pipes/round-number.pipe';
import * as moment from 'moment';
import { TransactionTypeService } from 'app/components/transaction-type/transaction-type.service';
import { AuthService } from 'app/components/login/auth.service';
import { Config } from '../../../app.config'
import { TransactionMovement, TransactionType } from 'app/components/transaction-type/transaction-type';
import { ReportsService } from '../reports.service';
import { ExportIvaComponent } from '../../export/export-iva/export-iva.component';
import {DateFormatPipe} from 'app/main/pipes/date-format.pipe';

@Component({
  selector: 'app-list-articles-requirements-by-transaction',
  templateUrl: './list-articles-requirements-by-transaction.component.html',
  styleUrls: ['./list-articles-requirements-by-transaction.component.css']
})
export class ListArticlesRequirementsByTransactionComponent implements OnInit {
  private subscription: Subscription = new Subscription();
  private roundNumberPipe: RoundNumberPipe = new RoundNumberPipe();
  private currencyPipe: CurrencyPipe = new CurrencyPipe('es-Ar');
  branches: Branch[];
  branchSelectedId: string;
  allowChangeBranch: boolean;
  alertMessage: string = '';
  loading: boolean = false;
  dateFormat = new DateFormatPipe();
  columns = attributes;
  filters: any[];
  employeeClosingId: string;
  origin: any;
  listType: string = 'statistics';
  transactionMovement: TransactionMovement;
  stateSelect: string = '';
  startDate: string;
  endDate: string;
  dateSelect: string;
  timezone: string = '-03:00';
  transactionTypes: TransactionType[];
  transactionTypesSelect;
  currentPage: number = 1;
  sort = { endDate: -1 };
  itemsPerPage = 10;
  modules: Observable<{}>;
  dropdownSettings = {
    singleSelection: false,
    defaultOpen: false,
    idField: '_id',
    textField: 'name',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    enableCheckAll: true,
    itemsShowLimit: 3,
    allowSearchFilter: true,
  };
  exportExcelComponent: any;
  items: any[] = new Array();
  totalItems: number = 0;
  config: Config;

  deleteTransaction = true;
  editTransaction = true;

  constructor(
    private _branchService: BranchService,
    private _transactionService: TransactionService,
    public alertConfig: NgbAlertConfig,
    public _modalService: NgbModal,
    public _transactionTypeService: TransactionTypeService,
    private _authService: AuthService,
    public _router: Router,
    public _reportsService: ReportsService,
  ) {
    this.transactionTypesSelect = new Array();
    this.filters = new Array();
    for (let field of this.columns) {
      if (field.defaultFilter) {
        this.filters[field.name] = field.defaultFilter;
      } else {
        this.filters[field.name] = '';
      }
    }
    this.startDate = moment().format('YYYY-MM-DD');
    this.endDate = moment().format('YYYY-MM-DD');
    this.dateSelect = 'creationDate';
  }

  async ngOnInit() {

    await this.getBranches({ operationType: { $ne: 'D' } }).then((branches) => {
      this.branches = branches;
    });

    let pathLocation: string[] = this._router.url.split('/');

    this.listType = pathLocation[2].charAt(0).toUpperCase() + pathLocation[2].slice(1);
    this.modules = observableOf(Config.modules);
    if (this.listType === 'Compras') {
      this.transactionMovement = TransactionMovement.Purchase;
    } else if (this.listType === 'Ventas') {
      this.transactionMovement = TransactionMovement.Sale;
    } else if (this.listType === 'Stock') {
      this.transactionMovement = TransactionMovement.Stock;
    } else if (this.listType === 'Fondos') {
      this.transactionMovement = TransactionMovement.Money;
    } else if (this.listType === 'Production') {
      this.transactionMovement = TransactionMovement.Production;
    }

    this._authService.getIdentity.subscribe(async (identity) => {
      // get permision

      if (identity?.permission?.collections.some((collection) => collection.name === "transacciones")) {
        // Encontrar el objeto con name igual a "transacciones"
        const transactionObject = identity.permission.collections.find(
          (collection) => collection.name === "transacciones"
        );

        // Guardar los valores de 'actions' en las variables correspondientes
        this.deleteTransaction = transactionObject.actions.delete;
        this.editTransaction = transactionObject.actions.edit;
      }

      if (identity && identity.origin) {
        this.branchSelectedId = identity.origin.branch._id;
        this.allowChangeBranch = false;

        for (let index = 0; index < this.columns.length; index++) {
          if (this.columns[index].name === 'branchDestination') {
            this.columns[index].defaultFilter = `{ "${identity.origin.branch._id}" }`;
          }
        }
      } else {
        this.allowChangeBranch = true;
        this.branchSelectedId = null;
      }
    });

    await this.getTransactionTypes().then((result) => {
      if (result) {
        this.transactionTypes = result;
      }
    });

    this.getItems();
  }

  public getBranches(match: {} = {}): Promise<Branch[]> {
    return new Promise<Branch[]>((resolve) => {
      this._branchService
        .getBranches(
          {}, // PROJECT
          match, // MATCH
          { number: 1 }, // SORT
          {}, // GROUP
          0, // LIMIT
          0, // SKIP
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
          },
        );
    });
  }

  public getTransactionTypes(): Promise<TransactionType[]> {
    return new Promise<TransactionType[]>((resolve, reject) => {
      let match = {};

      match = {
        transactionMovement: this.transactionMovement,
        operationType: { $ne: 'D' },
      };

      this._transactionTypeService
        .getAll({
          project: {
            _id: 1,
            transactionMovement: 1,
            requestArticles: 1,
            operationType: 1,
            name: 1,
            branch: 1,
          },
          match: match,
        })
        .subscribe(
          (result) => {
            if (result) {
              resolve(result.result);
            } else {
              resolve(null);
            }
          },
          (error) => {
            this.showMessage(error._body, 'danger', false);
            resolve(null);
          },
        );
    });
  }

  public getItems(): void {
    this.loading = true;

    this.items = [];

    const transactionTypesId = this.transactionTypesSelect.map(id => id._id)

    this.subscription.add(
        this._reportsService.getRequirementByTransaction(this.startDate, this.endDate, [this.stateSelect], transactionTypesId.length > 0 ? transactionTypesId : [''], this.dateSelect, this.branchSelectedId)
            .subscribe(
                (result) => {
                    this.loading = false;
                    if (result.result.length) {
                        if (this.itemsPerPage === 0) {
                            this.itemsPerPage = 10;
                            this.getItems();
                        } else {
                            this.items = result.result;
                            this.totalItems = result.result.length;
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
                },
            ),
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
            '1.2-2',
          );
          break;
        case 'percent':
          value = this.roundNumberPipe.transform(eval(val)) + '%';
          break;
        case 'date':
          value = this.dateFormat.transform(eval(val), 'DD/MM/YYYY');
          break;
        default:
          value = eval(val);
          break;
      }
    }

    return value;
  }

  public refresh(): void {
    this.getItems();
   
  }

  public exportIVA(): void {
    let modalRef = this._modalService.open(ExportIvaComponent, {
      size: 'lg',
      backdrop: 'static',
    });

    modalRef.componentInstance.type = this.listType;
    modalRef.result.then(
      (result) => {
        if (result === 'export') {
        }
      },
      (reason) => {},
    );
  }

  public drop(event: CdkDragDrop<string[]>): void {
    moveItemInArray(this.columns, event.previousIndex, event.currentIndex);
  }

  public pageChange(page): void {
    this.currentPage = page;
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