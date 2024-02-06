import { Component, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import {CurrencyPipe } from '@angular/common';
import { Router } from '@angular/router';
import { moveItemInArray, CdkDragDrop } from '@angular/cdk/drag-drop';
import { of as observableOf, Observable, Subscription } from 'rxjs';
import { NgbModal, NgbAlertConfig } from '@ng-bootstrap/ng-bootstrap';
import { Branch } from 'app/components/branch/branch';
import { BranchService } from 'app/components/branch/branch.service';
import { attributes } from '../reports';
import {RoundNumberPipe} from '../../../main/pipes/round-number.pipe';
import * as moment from 'moment';
import { TransactionTypeService } from 'app/components/transaction-type/transaction-type.service';
import { AuthService } from 'app/components/login/auth.service';
import { Config } from '../../../app.config'
import { TransactionMovement, TransactionType } from 'app/components/transaction-type/transaction-type';
import { ReportsService } from '../reports.service';
import {DateFormatPipe} from 'app/main/pipes/date-format.pipe';
import { ExportExcelComponent } from 'app/components/export/export-excel/export-excel.component';

@Component({
  selector: 'app-list-articles-requirements-by-transaction',
  templateUrl: './list-articles-requirements-by-transaction.component.html',
  styleUrls: ['./list-articles-requirements-by-transaction.component.css']
})
export class ListArticlesRequirementsByTransactionComponent implements OnInit {
  private subscription: Subscription = new Subscription();
  private roundNumberPipe: RoundNumberPipe = new RoundNumberPipe();
  private currencyPipe: CurrencyPipe = new CurrencyPipe('es-Ar');

  @ViewChild(ExportExcelComponent) exportExcelComponent: ExportExcelComponent;
  title: string = 'Requerimientos de producción'
  branches: Branch[];
  branchSelectedId: string;
  allowChangeBranch: boolean;
  alertMessage: string = '';
  loading: boolean = false;
  dateFormat = new DateFormatPipe();
  columns = attributes;
  filters:{ [key: string]: string } = {};
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
  itemsPerPage = 10;
  currentPage: number = 1;
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
  items: any[] = [];
  filterItems: any[] = [];
  totalItems: number = 0;
  
  config: Config;

  deleteTransaction = true;
  editTransaction = true;

  constructor(
    private _branchService: BranchService,
    public alertConfig: NgbAlertConfig,
    public _modalService: NgbModal,
    public _transactionTypeService: TransactionTypeService,
    private _authService: AuthService,
    public _router: Router,
    public _reportsService: ReportsService,
    
  ) {
    this.transactionTypesSelect = new Array();
    this.filters = {};
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
                            this.filterItems = result.result;
                            this.totalItems = result.result.length;
                        }
                    } else {
                        this.items = new Array();
                        this.filterItems = new Array();
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

  filterItem() {
    let filteredList = this.items;
    for (const column of this.columns) {
      const filterValue = this.filters[column.name]?.toString().trim();
      if (filterValue !== undefined && filterValue !== '' && column.filter) {
        filteredList = filteredList.filter((dato) => {
          const columnValue = dato[column.name];
          if (typeof columnValue === 'string') {
            return columnValue
              .toLowerCase()
              .includes(filterValue.toLowerCase());
          } else if (typeof columnValue === 'number') {
            return columnValue.toString() === filterValue;
          }

          return false;
        });
      }
    }

    this.filterItems = filteredList;
    this.totalItems = filteredList.length;
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

  public orderBy(value){
 console.log(value)
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
  

  public exportItems(): void {
    this.exportExcelComponent.items = this.items;
    this.exportExcelComponent.export();
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