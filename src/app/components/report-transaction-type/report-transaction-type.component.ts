import { Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';

import { NgbAlertConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { Config } from 'app/app.config';
import { TransactionService } from 'app/core/services/transaction.service';

import { Branch } from '@types';
import { User } from 'app/components/user/user';
import { AuthService } from 'app/core/services/auth.service';
import { BranchService } from 'app/core/services/branch.service';
import * as moment from 'moment';
import 'moment/locale/es';
import { Observable } from 'rxjs';
import { TransactionTypeService } from '../../core/services/transaction-type.service';
import { TransactionMovement, TransactionType } from '../transaction-type/transaction-type';
import { Transaction } from '../transaction/transaction';

@Component({
  selector: 'app-report-transaction-type',
  templateUrl: './report-transaction-type.component.html',
  styleUrls: ['./report-transaction-type.component.scss'],
  providers: [NgbAlertConfig],
  encapsulation: ViewEncapsulation.None,
})
export class ReportTransactionTypeComponent implements OnInit {
  public identity$: Observable<User>;
  public transactions: Transaction[] = new Array();
  public transactionTypes: TransactionType[] = new Array();
  public areTransactionTypesEmpty: boolean = true;
  public alertMessage: string = '';
  public userType: string;
  public orderTerm: string[] = ['name'];
  public propertyTerm: string;
  public areFiltersVisible: boolean = false;
  public loading: boolean = false;
  @Output() eventAddItem: EventEmitter<TransactionType> = new EventEmitter<TransactionType>();
  public itemsPerPage = 10;
  public totalItems = 0;
  public userCountry: string;
  public transactionMovement: TransactionMovement;
  public pathLocation: any[];
  public items: any[] = new Array();
  @Input() startDate: string;
  @Input() startTime: string;
  @Input() endDate: string;
  @Input() endTime: string;
  @Input() limit: number = 0;
  public areItemsEmpty: boolean = true;
  public totalItem = 0;
  public totalAmount = 0;
  public totalBase = 0;
  public branches: Branch[];
  public branchSelectedId: String;
  public allowChangeBranch: boolean;

  public currentPage: number = 0;
  public displayedColumns = [
    'type.transactionMovement',
    'type.name',
    'type.requestArticles',
    'type.allowEdit',
    'type.allowDelete',
    'type.electronics',
    'origin',
    'letter',
    'number',
    'endDate',
    'company.name',
    'employeeClosing.name',
    'turnClosing.endDate',
    'cashBox.number',
    'madein',
    'state',
    'observation',
    'discountAmount',
    'totalPrice',
    'operationType',
    'CAE',
    'balance',
    'basePrice',
  ];
  public filters: any[];
  public filterValue: string;

  constructor(
    public _transactionTypeService: TransactionTypeService,
    public _transactionService: TransactionService,
    public _router: Router,
    public _modalService: NgbModal,
    public alertConfig: NgbAlertConfig,
    public _authService: AuthService,
    private _branchService: BranchService
  ) {
    this.identity$ = this._authService.getIdentity;
    this.filters = new Array();
    for (let field of this.displayedColumns) {
      this.filters[field] = '';
    }
    this.startDate = moment().format('YYYY-MM-DD');
    this.startTime = moment('00:00', 'HH:mm').format('HH:mm');
    this.endDate = moment().format('YYYY-MM-DD');
    this.endTime = moment('23:59', 'HH:mm').format('HH:mm');
  }

  async ngOnInit() {
    this.transactionMovement = TransactionMovement.Sale;
    this.userCountry = Config.country;
    this.pathLocation = this._router.url.split('/');
    this.userType = this.pathLocation[1];
    await this.getBranches({ operationType: { $ne: 'D' } }).then((branches) => {
      this.branches = branches;
    });
    this._authService.getIdentity.subscribe(async (identity) => {
      if (identity && identity.origin) {
        this.allowChangeBranch = false;
        this.branchSelectedId = identity.origin.branch._id;
      } else {
        this.allowChangeBranch = true;
        this.branchSelectedId = null;
      }
    });
    if (this.userType === 'report') {
      this.getTransactionTypesV2();
    } else {
      this.getTransactionTypes();
    }
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

  public getTransactionTypes(): void {
    this.loading = true;

    this._transactionTypeService
      .getAll({
        match: { operationType: { $ne: 'D' } },
      })
      .subscribe(
        (result) => {
          if (result.status != 200) {
            if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
            this.loading = false;
            this.transactionTypes = new Array();
            this.areTransactionTypesEmpty = true;
          } else {
            this.hideMessage();
            this.loading = false;
            this.transactionTypes = result.result;
            this.totalItems = this.transactionTypes.length;
            this.areTransactionTypesEmpty = false;
          }
        },
        (error) => {
          this.showMessage(error._body, 'danger', false);
          this.loading = false;
        }
      );
  }

  public getTransactionTypesV2(): void {
    this.loading = true;

    let movement;

    switch (this.pathLocation[2]) {
      case 'venta':
        movement = 'Venta';
        break;
      case 'compra':
        movement = 'Compra';
        break;
      case 'fondo':
        movement = 'Fondos';
      default:
        break;
    }

    let timezone = '-03:00';
    if (Config.timezone && Config.timezone !== '') {
      timezone = Config.timezone.split('UTC')[1];
    }

    // FILTRAMOS LA CONSULTA
    let match = `{  "operationType": { "$ne": "D" },
                    "state" : "Cerrado",
                    "type.transactionMovement" : "${movement}",
                    "type.operationType": { "$ne": "D" },
                    "endDate" : { "$gte": {"$date": "${this.startDate}T${this.startTime}:00${timezone}"},
                                  "$lte": {"$date": "${this.endDate}T${this.endTime}:00${timezone}"}
                                }`;

    if (this.branchSelectedId) {
      match += `, "branchDestination": { "$oid": "${this.branchSelectedId}" }`;
    }

    match += `}`;
    match = JSON.parse(match);

    // ARMAMOS EL PROJECT SEGÚN DISPLAYCOLUMNS
    let project = {
      'type.name': 1,
      'type.movement': 1,
      totalPrice: 1,
      basePrice: 1,
      operationType: 1,
      state: 1,
      'type.transactionMovement': 1,
      'type.operationType': 1,
      endDate: 1,
      branchDestination: 1,
    };

    // AGRUPAMOS EL RESULTADO
    let group = {
      _id: { name: '$type.name', movement: '$type.movement' },
      count: { $sum: 1 },
      totalPrice: { $sum: '$totalPrice' },
      basePrice: { $sum: '$basePrice' },
    };

    this._transactionService
      .getTransactionsV2(
        project, // PROJECT
        match, // MATCH
        { 'type.name': 1 }, // SORT
        group, // GROUP
        0, // LIMIT
        0 // SKIP
      )
      .subscribe(
        (result) => {
          this.loading = false;
          if (result && result.length > 0) {
            this.items = result;
            this.areItemsEmpty = false;
          } else {
            this.items = new Array();
            this.areItemsEmpty = true;
          }
          this.calculateTotal();
        },
        (error) => {
          this.showMessage(error._body, 'danger', false);
          this.loading = false;
          this.totalItems = 0;
        }
      );
  }

  public orderBy(term: string, property?: string): void {
    if (this.orderTerm[0] === term) {
      this.orderTerm[0] = '-' + term;
    } else {
      this.orderTerm[0] = term;
    }
    this.propertyTerm = property;
  }

  public refresh(): void {
    this.getTransactionTypes();
  }

  public calculateTotal(): void {
    this.totalItem = 0;
    this.totalAmount = 0;
    this.totalBase = 0;

    for (let index = 0; index < this.items.length; index++) {
      this.totalItem = this.totalItem + this.items[index]['count'];
      this.totalBase = this.totalBase + this.items[index]['basePrice'];
      if (this.items[index]['_id']['movement'] === 'Entrada') {
        this.totalAmount = this.totalAmount + this.items[index]['totalPrice'];
      } else {
        this.totalAmount = this.totalAmount - this.items[index]['totalPrice'];
      }
    }
  }

  public getCode(transactionType: TransactionType, letter: string): number {
    let code: number;
    if (transactionType.codes) {
      let jsonString = JSON.stringify(transactionType.codes);
      let json = JSON.parse(jsonString);
      json.find(function (x) {
        if (x.letter === letter) {
          code = x.code;
        }
      });
    }

    return code;
  }

  public addItem(transactionTypeSelected) {
    this.eventAddItem.emit(transactionTypeSelected);
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
