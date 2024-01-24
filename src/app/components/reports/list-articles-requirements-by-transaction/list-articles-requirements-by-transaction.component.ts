import { Component, OnInit} from '@angular/core';
import {Branch} from 'app/components/branch/branch';
import {BranchService} from 'app/components/branch/branch.service';
import {attributes} from 'app/components/transaction/transaction';
import { TransactionService } from 'app/components/transaction/transaction.service';
import * as moment from 'moment';
import { TransactionTypeService } from 'app/components/transaction-type/transaction-type.service';
import { NgbAlertConfig } from '@ng-bootstrap/ng-bootstrap';
import {of as observableOf, Observable, Subscription, observable} from 'rxjs';
import { Router } from '@angular/router';
import { AuthService } from 'app/components/login/auth.service';
import {Config} from '../../../app.config'
import { TransactionMovement, TransactionType } from 'app/components/transaction-type/transaction-type';

@Component({
  selector: 'app-list-articles-requirements-by-transaction',
  templateUrl: './list-articles-requirements-by-transaction.component.html',
  styleUrls: ['./list-articles-requirements-by-transaction.component.css']
})
export class ListArticlesRequirementsByTransactionComponent implements OnInit {
  private subscription: Subscription = new Subscription();
  branches: Branch[];
  branchSelectedId: String;
  allowChangeBranch: boolean;
  alertMessage: string = '';
  loading: boolean = false;
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
  sort = {endDate: -1};
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
    public _transactionTypeService: TransactionTypeService,
    private _authService: AuthService,
    public _router: Router,
  ){
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
  
  async ngOnInit(){

    await this.getBranches({operationType: {$ne: 'D'}}).then((branches) => {
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
    
    this.getItems();

    await this.getTransactionTypes().then((result) => {
      if (result) {
        this.transactionTypes = result;
      }
    });
  }

  public getBranches(match: {} = {}): Promise<Branch[]> {
    return new Promise<Branch[]>((resolve) => {
      this._branchService
        .getBranches(
          {}, // PROJECT
          match, // MATCH
          {number: 1}, // SORT
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
        operationType: {$ne: 'D'},
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

    // FILTRAMOS LA CONSULTA
    let match = `{`;

    for (let i = 0; i < this.columns.length; i++) {
      if (this.columns[i].visible || this.columns[i].required) {
        let value = this.filters[this.columns[i].name];

        if (value && value != '') {
          if (this.columns[i].defaultFilter) {
            match += `"${this.columns[i].name}": ${this.columns[i].defaultFilter}`;
          } else {
            if (this.columns[i].name.includes('_id')) {
              match += `"${this.columns[i].name}": { "$oid": "${value}" }`;
            } else {
              if (value.includes('$')) {
                match += `"${this.columns[i].name}": { ${value} }`;
              } else {
                match += `"${this.columns[i].name}": { "$regex": "${value}", "$options": "i"}`;
              }
            }
          }
          if (i < this.columns.length - 1) {
            match += ',';
          }
        }
      }
    }

    if (this.employeeClosingId) {
      match += `,"employeeClosing._id": { "$oid" : "${this.employeeClosingId}"},`;
    }

    if (this.origin) {
      match += `,"origin": "${this.origin}"`;
    }
    if (this.branchSelectedId) {
      match += `,"branchOrigin": {"$oid": "${this.branchSelectedId}"},`;
    }

    if (match.charAt(match.length - 1) === '}') match += ',';
    match += `"type.transactionMovement": "${this.transactionMovement}",`;
    if (this.stateSelect && this.stateSelect !== '')
      match += `"state": "${this.stateSelect}",`;
    match += `"${this.dateSelect}" : {
                    "$gte" : { "$date" : "${this.startDate}T00:00:00${this.timezone}" },
                    "$lte" : { "$date" : "${this.endDate}T23:59:59${this.timezone}" }
                }`;

    if (match.charAt(match.length - 1) === ',')
      match = match.substring(0, match.length - 1);

    match += `}`;

    match = JSON.parse(match);

    let transactionTypes = [];

    if (this.transactionTypesSelect && this.transactionTypesSelect.length > 0) {
      this.transactionTypesSelect.forEach((element) => {
        transactionTypes.push({$oid: element._id});
      });
      match['type._id'] = {$in: transactionTypes};
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
    project += `,"branchOrigin":1`;
    project += `}`;

    project = JSON.parse(project);

    // AGRUPAMOS EL RESULTADO
    let group = {
      _id: null,
      count: {$sum: 1},
      items: {$push: '$$ROOT'},
    };

    let page = 0;

    if (this.currentPage != 0) {
      page = this.currentPage - 1;
    }
    let skip = !isNaN(page * this.itemsPerPage) ? page * this.itemsPerPage : 0; // SKIP
    let limit = this.itemsPerPage;

    this.subscription.add(
      this._transactionService
        .getTransactionsV2(
          project, // PROJECT
          match, // MATCH
          this.sort, // SORT
          group, // GROUP
          limit, // LIMIT
          skip, // SKIP
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
  
  public showMessage(message: string, type: string, dismissible: boolean): void {
    this.alertMessage = message;
    this.alertConfig.type = type;
    this.alertConfig.dismissible = dismissible;
  }

  public hideMessage(): void {
    this.alertMessage = '';
  }
}

