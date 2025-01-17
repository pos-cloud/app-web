import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';

import {
  NgbActiveModal,
  NgbAlertConfig,
  NgbModal,
} from '@ng-bootstrap/ng-bootstrap';
import {
  Movements,
  TransactionMovement,
} from '../transaction-type/transaction-type';
import { Transaction, TransactionState } from '../transaction/transaction';

//service
import { CancellationTypeService } from '../../core/services/cancellation-type.service';
import { MovementOfArticleService } from '../../core/services/movement-of-article.service';
import { TransactionService } from '../../core/services/transaction.service';

import { Router } from '@angular/router';
import { ApiResponse } from '@types';
import { Config } from 'app/app.config';
import { ArticleFieldType } from 'app/components/article-field/article-field';
import { ArticleFields } from 'app/components/article-field/article-fields';
import { CancellationType } from 'app/components/cancellation-type/cancellation-type';
import { MovementOfArticle } from 'app/components/movement-of-article/movement-of-article';
import { MovementOfCancellation } from 'app/components/movement-of-cancellation/movement-of-cancellation';
import { Taxes } from 'app/components/tax/taxes';
import { CompanyService } from 'app/core/services/company.service';
import { MovementOfCancellationService } from 'app/core/services/movement-of-cancellation.service';
import { MovementOfCashService } from 'app/core/services/movement-of-cash.service';
import { ToastService } from 'app/shared/components/toast/toast.service';
import { RoundNumberPipe } from 'app/shared/pipes/round-number.pipe';
import { TranslateMePipe } from 'app/shared/pipes/translate-me';
import { ArticleService } from '../../core/services/article.service';
import { Article } from '../article/article';
import { MovementOfCash } from '../movement-of-cash/movement-of-cash';
import { SelectMovementsOfCashesComponent } from '../movement-of-cash/select-movements-of-cashes/select-movements-of-cashes.component';
import { TaxBase } from '../tax/tax';
import { ViewTransactionComponent } from '../transaction/view-transaction/view-transaction.component';

@Component({
  selector: 'app-movement-of-cancellation',
  templateUrl: './movement-of-cancellation.component.html',
  styleUrls: ['./movement-of-cancellation.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [TranslateMePipe],
})
export class MovementOfCancellationComponent implements OnInit {
  @Input() transactionDestinationId: string;
  @Input() transactionDestinationViewId: string;
  @Input() transactionOriginViewId: string;
  @Input() totalPrice: number = 0;
  @Input() selectionView: boolean = false;
  @Input() movementsOfCancellations: MovementOfCancellation[] = new Array();
  @Input() movementsOfCashes: MovementOfCash[] = new Array();
  focusEvent = new EventEmitter<boolean>();
  movsOfArticles: MovementOfArticle[] = new Array();
  transactionDestination: Transaction;
  requestCompany: boolean = false;
  transactionMovement: TransactionMovement;
  transactions: Transaction[];
  cancellationTypes: CancellationType[];
  alertMessage: string = '';
  loading: boolean = false;
  totalItems: number = -1;
  orderTerm: string[] = ['endDate'];
  existingCanceled = [];
  filters: any[];
  filterValue: string;
  roundNumber = new RoundNumberPipe();
  userCountry: string;
  balanceSelected: number = 0;
  userType: string;
  automaticSelectionReady: boolean = false;
  displayedColumns = [
    '_id',
    'endDate',
    'number',
    'letter',
    'state',
    'totalPrice',
    'balance',
    'operationType',
    'type.name',
    'type._id',
    'type.requestArticles',
    'company._id',
    'company.city',
    'company.state.name',
    'company.group.description',
  ];

  constructor(
    private _cancellationTypeService: CancellationTypeService,
    private _movementOfCancellation: MovementOfCancellationService,
    private _transactionService: TransactionService,
    private _companyService: CompanyService,
    private _movementOfCashService: MovementOfCashService,
    private _movementOfArticleService: MovementOfArticleService,
    private _movementOfCancellationService: MovementOfCancellationService,
    private _articleService: ArticleService,
    private _toastService: ToastService,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig,
    public _modalService: NgbModal,
    public _router: Router,
    public translatePipe: TranslateMePipe
  ) {
    this.userCountry = Config.country;
    const pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];
    this.filters = new Array();
    for (let field of this.displayedColumns) {
      this.filters[field] = '';
    }
    this.existingCanceled = new Array();
    this.transactions = new Array();
  }

  async ngOnInit() {
    if (this.transactionDestinationViewId || this.transactionOriginViewId) {
      this.getCancellationsOfMovements();
    } else {
      this.transactionDestination = await this.getTransaction(
        this.transactionDestinationId
      );
      if (this.transactionDestination) {
        this.getCancellationTypes();
      }
    }
  }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  getCancellationsOfMovements() {
    this.loading = true;

    let match;
    // FILTRAMOS LA CONSULTA
    if (this.transactionOriginViewId) {
      match = {
        transactionOrigin: { $oid: this.transactionOriginViewId },
        operationType: { $ne: 'D' },
      };
    } else {
      match = {
        transactionDestination: { $oid: this.transactionDestinationViewId },
        operationType: { $ne: 'D' },
      };
    }

    // CAMPOS A TRAER
    let project = {
      balance: 1,
      transactionOrigin: 1,
      transactionDestination: 1,
      operationType: 1,
    };

    this._movementOfCancellation
      .getMovementsOfCancellations(
        project, // PROJECT
        match, // MATCH
        { order: 1 }, // SORT
        {}, // GROUP
        0, // LIMIT
        0 // SKIP
      )
      .subscribe(
        async (result) => {
          if (
            result &&
            result.movementsOfCancellations &&
            result.movementsOfCancellations.length > 0
          ) {
            for (
              let index = 0;
              index < result.movementsOfCancellations.length;
              index++
            ) {
              let transaction = new Transaction();
              if (this.transactionOriginViewId) {
                transaction = await this.getTransaction(
                  result.movementsOfCancellations[index].transactionDestination
                );
              } else {
                transaction = await this.getTransaction(
                  result.movementsOfCancellations[index].transactionOrigin
                );
              }
              if (
                transaction &&
                transaction.state !== TransactionState.Open &&
                transaction.state !== TransactionState.Pending
              ) {
                transaction.balance = this.roundNumber.transform(
                  result.movementsOfCancellations[index].balance
                );
                this.transactions.push(transaction);
              } else {
                this.totalItems = 0;
                this.loading = false;
              }
            }
          } else {
            this._toastService.showToast({
              type: 'danger',
              message: 'No se encontraron transactiones relacionadas',
            });
            this.totalItems = 0;
          }
          this.loading = false;
        },
        (error) => {
          this._toastService.showToast(error);
          this.totalItems = 0;
        }
      );
  }

  getTransaction(transactionId: string): Promise<Transaction> {
    return new Promise<Transaction>((resolve, reject) => {
      this.loading = true;

      this._transactionService.getTransaction(transactionId).subscribe(
        (result) => {
          if (!result.transaction) {
            this.totalItems = 0;
            resolve(null);
          } else {
            this.loading = false;
            resolve(result.transaction);
          }
        },
        (error) => {
          this._toastService.showToast(error);
          this.totalItems = 0;
          this.loading = false;
          resolve(null);
        }
      );
    });
  }

  getCancellationTypes(): void {
    this.loading = true;

    // CAMPOS A TRAER
    let project = {
      'origin._id': 1,
      'origin.type': 1,
      'destination._id': 1,
      operationType: 1,
      automaticSelection: 1,
      modifyBalance: 1,
      requestCompany: 1,
      stateOrigin: 1,
      updatePrices: 1,
      requestStatusOrigin: 1,
    };

    this._cancellationTypeService
      .getCancellationTypes(
        project, // PROJECT
        {
          'destination._id': { $oid: this.transactionDestination.type._id },
          origin: { $exists: true },
          operationType: { $ne: 'D' },
        }, // MATCH
        {}, // SORT
        {}, // GROUP
        0, // LIMIT
        0 // SKIP
      )
      .subscribe(
        (result) => {
          if (
            result &&
            result.cancellationTypes &&
            result.cancellationTypes.length > 0
          ) {
            this.cancellationTypes = result.cancellationTypes;
            this.getTransactions();
          } else {
            this.totalItems = 0;
          }
          this.loading = false;
        },
        (error) => {
          this._toastService.showToast(error);
          this.totalItems = 0;
          this.loading = false;
        }
      );
  }

  async getTransactions() {
    this.loading = true;

    /// ORDENAMOS LA CONSULTA
    let sortAux;
    if (this.orderTerm[0].charAt(0) === '-') {
      sortAux = `{ "${this.orderTerm[0].split('-')[1]}" : -1 }`;
    } else {
      sortAux = `{ "${this.orderTerm[0]}" : 1 }`;
    }
    sortAux = JSON.parse(sortAux);

    // FILTRAMOS LA CONSULTA
    let match = `{`;
    for (let i = 0; i < this.displayedColumns.length; i++) {
      let value = this.filters[this.displayedColumns[i]];
      if (value && value != '') {
        match += `"${this.displayedColumns[i]}": { "$regex": "${value}", "$options": "i"}`;
        match += ',';
      }
    }
    match += `"$or": [`;

    for (let index = 0; index < this.cancellationTypes.length; index++) {
      match += `{ "$and":[{ "type._id"  : "${this.cancellationTypes[index].origin._id}"},{"state":"${this.cancellationTypes[index].requestStatusOrigin}"}]}`;
      if (this.cancellationTypes[index].requestCompany) {
        this.requestCompany = true;
      }
      if (index < this.cancellationTypes.length) {
        match += ',';
      }
    }

    match = match.slice(0, -1);

    match += `],`;

    if (this.requestCompany && this.transactionDestination.company) {
      match += `"company._id":  "${this.transactionDestination.company._id}",`;
    }

    match += `"operationType": { "$ne": "D" }, "balance": { "$gt": 0 } }`;
    match = JSON.parse(match);

    let timezone = '-03:00';
    if (Config.timezone && Config.timezone !== '') {
      timezone = Config.timezone.split('UTC')[1];
    }

    // ARMAMOS EL PROJECT SEGÚN DISPLAYCOLUMNS
    let project = {
      _id: 1,
      endDate: {
        $dateToString: {
          date: '$endDate',
          format: '%d/%m/%Y',
          timezone: timezone,
        },
      },
      number: { $toString: '$number' },
      letter: 1,
      state: 1,
      totalPrice: 1,
      balance: 1,
      balanceSelected: '$balance',
      operationType: 1,
      'company._id': { $toString: '$company._id' },
      'company.city': 1,
      'company.state.name': 1,
      'company.group.description': 1,
      'type._id': { $toString: '$type._id' },
      'type.name': 1,
      'type.requestArticles': 1,
      'type.requestPaymentMethods': 1,
      'type.movement': 1,
    };

    this._transactionService
      .getTransactionsV2(
        project, // PROJECT
        match, // MATCH
        sortAux, // SORT
        {
          _id: null,
          count: { $sum: 1 },
          transactions: { $push: '$$ROOT' },
        }, // GROUP
        0, // LIMIT
        0 // SKIP
      )
      .subscribe(
        async (result) => {
          this.loading = false;
          if (result && result.length > 0 && result[0].transactions) {
            this.transactions = result[0].transactions;
            this.totalItems = result[0].count;
            if (this.transactions.length > 0) {
              for (let transaction of this.transactions) {
                if (
                  !transaction.type.requestArticles &&
                  transaction.type.requestPaymentMethods
                ) {
                  let query = 'where="transaction":"' + transaction._id + '"';
                  await this.getMovementsOfCashes(query).then(
                    (movementsOfCashes) => {
                      for (let mov of movementsOfCashes) {
                        if (mov.type.allowToFinance) {
                          transaction['isFinanced'] = true;
                        }
                      }
                    }
                  );
                }
              }
              if (this.totalPrice > 0 && this.balanceSelected === 0) {
                if (
                  !this.movementsOfCancellations ||
                  this.movementsOfCancellations.length === 0
                ) {
                  this.movementsOfCancellations =
                    await this.getMovementsOfCancellations();
                  if (
                    this.movementsOfCancellations &&
                    this.movementsOfCancellations.length > 0
                  ) {
                    for (let mov of this.movementsOfCancellations) {
                      mov['saved'] = true;
                    }
                  }
                }

                if (
                  this.movementsOfCancellations &&
                  this.movementsOfCancellations.length > 0
                ) {
                  for (let transaction of this.transactions) {
                    for (let mov of this.movementsOfCancellations) {
                      if (mov.transactionOrigin._id === transaction._id) {
                        transaction['balanceSelected'] =
                          this.roundNumber.transform(mov.balance);
                      }
                    }
                  }
                  this.recalculateBalanceSelected();
                } else {
                  this.movementsOfCancellations = new Array();
                  if (
                    !this.automaticSelectionReady &&
                    this.cancellationTypes[0].automaticSelection
                  )
                    this.selectAutomatically();
                }
              } else if (
                this.totalPrice === 0 &&
                this.balanceSelected === 0 &&
                !this.automaticSelectionReady &&
                this.cancellationTypes[0].automaticSelection
              ) {
                this.movementsOfCancellations = new Array();
                this.selectAutomatically();
              }
            }
          } else {
            this.transactions = new Array();
            this.totalItems = 0;
          }
        },
        (error) => {
          this._toastService.showToast(error);
          this.loading = false;
          this.totalItems = 0;
        }
      );
  }

  getMovementsOfCashes(query: string): Promise<MovementOfCash[]> {
    return new Promise<MovementOfCash[]>((resolve, reject) => {
      this.loading = true;
      this._movementOfCashService.getMovementsOfCashes(query).subscribe(
        (result) => {
          this.loading = false;
          if (!result.movementsOfCashes) {
            resolve(null);
          } else {
            resolve(result.movementsOfCashes);
          }
        },
        (error) => {
          this.loading = false;
          resolve(null);
        }
      );
    });
  }

  getMovementsOfCancellations(): Promise<MovementOfCancellation[]> {
    return new Promise<MovementOfCancellation[]>((resolve, reject) => {
      this._movementOfCancellationService
        .getMovementsOfCancellations(
          {
            _id: 0,
            'transactionOrigin._id': 1,
            'transactionDestination._id': 1,
            balance: 1,
            operationType: 1,
            'transactionOrigin.type.name': 1,
            'transactionOrigin.type.movement': 1,
            'transactionOrigin.type.transactionMovement': 1,
            'transactionOrigin.type.electronics': 1,
            'transactionOrigin.number': 1,
            'transactionOrigin.operationType': 1,
            'transactionOrigin.balance': 1,
          }, // PROJECT
          {
            'transactionDestination._id': {
              $oid: this.transactionDestination._id,
            },
            operationType: { $ne: 'D' },
            'transactionOrigin.operationType': { $ne: 'D' },
          }, // MATCH
          {}, // SORT
          {}, // GROUP
          0, // LIMIT
          0 // SKIP
        )
        .subscribe(
          (result) => {
            if (
              result &&
              result.movementsOfCancellations &&
              result.movementsOfCancellations.length > 0
            ) {
              resolve(result.movementsOfCancellations);
            } else {
              resolve(null);
            }
          },
          (error) => {
            this._toastService.showToast(error);
            resolve(null);
          }
        );
    });
  }

  async selectAutomatically() {
    this.automaticSelectionReady = true;
    if (this.totalPrice > 0) {
      for (let transaction of this.transactions) {
        if (this.totalPrice > this.balanceSelected) {
          await this.selectTransaction(transaction, true);
          this.recalculateBalanceSelected();
        }
      }
    } else if (this.totalPrice === 0) {
      for (let transaction of this.transactions) {
        await this.selectTransaction(transaction, true);
        this.recalculateBalanceSelected();
      }
    }
  }

  orderBy(term: string): void {
    if (this.orderTerm[0] === term) {
      this.orderTerm[0] = '-' + term;
    } else {
      this.orderTerm[0] = term;
    }

    this.getTransactions();
  }

  openModal(op: string, transaction: Transaction): void {
    let modalRef;
    switch (op) {
      case 'view':
        modalRef = this._modalService.open(ViewTransactionComponent, {
          size: 'lg',
          backdrop: 'static',
        });
        modalRef.componentInstance.transactionId = transaction._id;
        break;
      case 'select-movements-of-cashes':
        if (this.isTransactionSelected(transaction)) {
          this.deleteTransactionSelected(transaction);
          this.recalculateBalanceSelected();
        } else {
          modalRef = this._modalService.open(SelectMovementsOfCashesComponent, {
            size: 'lg',
            backdrop: 'static',
          });
          modalRef.componentInstance.transactionId = transaction._id;
          modalRef.componentInstance.totalPrice = transaction.totalPrice;
          modalRef.result.then(
            async (result) => {
              if (result && result.movementsOfCashes) {
                if (result.transaction) {
                  transaction.totalPrice = result.transaction.totalPrice;
                  transaction.balance = result.transaction.balance;
                }
                let balance = 0;
                for (let mov of result.movementsOfCashes) {
                  balance += mov.balanceCanceled;
                }
                await this.selectTransaction(transaction, false, balance);
                this.updateBalanceOrigin(transaction);
                this.assignMovementsOfCashes(result.movementsOfCashes);
                this.recalculateBalanceSelected();
              }
            },
            (reason) => {}
          );
        }
        break;
    }
  }

  assignMovementsOfCashes(movs: MovementOfCash[]) {
    for (let mov of movs) {
      let exists: boolean = false;
      for (let m of this.movementsOfCashes) {
        if (mov._id.toString() === m._id.toString()) {
          if (mov.balanceCanceled === m.balanceCanceled) {
            exists = true;
          } else {
            m.balanceCanceled = mov.balanceCanceled;
          }
        }
      }
      if (!exists && mov.balanceCanceled > 0) this.movementsOfCashes.push(mov);
    }
  }

  async selectTransaction(
    transactionSelected: Transaction,
    automatic: boolean = false,
    balanceSelected: number = null,
    cancelForTotal: boolean = true
  ) {
    transactionSelected = await this.getTransaction(transactionSelected._id);
    let isValid: boolean = true;

    if (this.isTransactionSelected(transactionSelected)) {
      if (!automatic) this.deleteTransactionSelected(transactionSelected);
    } else {
      let movementOfCancellation = new MovementOfCancellation();
      movementOfCancellation.transactionOrigin = transactionSelected;
      movementOfCancellation.transactionDestination =
        this.transactionDestination;
      if (this.modifyBalance(transactionSelected)) {
        let transBalance = 0;
        if (
          (transactionSelected.type.transactionMovement ===
            TransactionMovement.Sale &&
            transactionSelected.type.movement === Movements.Outflows) ||
          (transactionSelected.type.transactionMovement ===
            TransactionMovement.Purchase &&
            transactionSelected.type.movement === Movements.Inflows) ||
          transactionSelected.type._id === this.transactionDestination.type._id
        ) {
          if (balanceSelected) {
            transBalance = balanceSelected * -1;
          } else {
            transBalance = transactionSelected.balance * -1;
          }
        } else {
          if (
            transactionSelected.balance > this.totalPrice &&
            this.totalPrice !== 0
          ) {
            if (balanceSelected) {
              transBalance = balanceSelected;
            } else {
              transBalance = this.totalPrice;
            }
          } else {
            if (balanceSelected) {
              transBalance = balanceSelected;
            } else {
              transBalance = transactionSelected.balance;
            }
          }
        }
        if (
          automatic &&
          this.totalPrice < transBalance + this.balanceSelected
        ) {
          if (this.totalPrice === 0) {
            movementOfCancellation.balance =
              this.roundNumber.transform(transBalance);
          } else {
            if (balanceSelected) {
              isValid = false;
              this._toastService.showToast({
                type: 'danger',
                message:
                  'La suma de saldo a cancelar no puede ser mayor al balance de la transacción.',
              });
            } else {
              movementOfCancellation.balance = this.roundNumber.transform(
                this.totalPrice - this.balanceSelected
              );
            }
          }
        } else {
          movementOfCancellation.balance =
            this.roundNumber.transform(transBalance);
        }
      } else {
        movementOfCancellation.balance = 0;
      }
      if (isValid) {
        for (let t of this.transactions) {
          if (t._id.toString() == transactionSelected._id.toString()) {
            t['balanceSelected'] = this.roundNumber.transform(
              movementOfCancellation.balance
            );
          }
        }
        this.movementsOfCancellations.push(movementOfCancellation);
        if (cancelForTotal) {
          await this.getMovementOfCashes({
            operationType: { $ne: 'D' },
            transaction: { $oid: transactionSelected._id },
            balanceCanceled: { $eq: 0 },
          }).then((movementsOfCashes) => {
            if (movementsOfCashes && movementsOfCashes.length > 0) {
              for (let mov of movementsOfCashes) {
                mov.balanceCanceled = mov.amountPaid;
              }
              this.assignMovementsOfCashes(movementsOfCashes);
            }
          });
        }
      }
    }
    this.recalculateBalanceSelected();
  }

  getMovementOfCashes(match: {}): Promise<MovementOfCash[]> {
    return new Promise<MovementOfCash[]>((resolve, reject) => {
      this.loading = true;
      /// ORDENAMOS LA CONSULTA
      let sortAux;
      if (this.orderTerm[0].charAt(0) === '-') {
        sortAux = `{ "${this.orderTerm[0].split('-')[1]}" : -1 }`;
      } else {
        sortAux = `{ "${this.orderTerm[0]}" : 1 }`;
      }
      sortAux = JSON.parse(sortAux);

      let project = {
        _id: 1,
        quota: 1,
        expirationDate: 1,
        'type._id': 1,
        'type.name': 1,
        amountPaid: 1,
        transaction: 1,
        operationType: 1,
        balanceCanceled: 1,
      };
      this._movementOfCashService
        .getMovementsOfCashesV2(project, match, sortAux, {}, 0, 0)
        .subscribe(
          (res) => {
            this.loading = false;
            res.movementsOfCashes
              ? resolve(res.movementsOfCashes)
              : resolve([]);
          },
          (error) => reject(error)
        );
    });
  }

  recalculateBalanceSelected(): void {
    this.balanceSelected = 0;
    for (let mov of this.movementsOfCancellations) {
      if (!this.isMovementClosed(mov.transactionOrigin)) {
        this.balanceSelected += this.roundNumber.transform(mov.balance);
      }
    }
    this.roundNumber.transform(this.balanceSelected);
  }

  private isMovementClosed(transaction: Transaction): boolean {
    let closed: boolean = true;

    for (let trans of this.transactions) {
      if (trans._id.toString() === transaction._id.toString()) {
        closed = false;
      }
    }

    return closed;
  }

  modifyBalance(transaction: Transaction) {
    let modify: boolean = false;

    for (let canc of this.cancellationTypes) {
      if (canc.origin._id.toString() === transaction.type._id) {
        modify = canc.modifyBalance;
      }
    }

    return modify;
  }

  deleteAllMovements(): void {
    for (let trans of this.transactions) {
      this.deleteTransactionSelected(trans);
    }
    this.recalculateBalanceSelected();
  }

  public deleteTransactionSelected(transaction: Transaction): void {
    let movementToDelete: number;

    for (let i = 0; i < this.movementsOfCancellations.length; i++) {
      if (
        this.movementsOfCancellations[i].transactionOrigin._id.toString() ===
        transaction._id.toString()
      ) {
        movementToDelete = i;
      }
    }
    if (movementToDelete !== undefined) {
      this.movementsOfCancellations.splice(movementToDelete, 1);
    }
  }

  public isTransactionSelected(transaction: Transaction) {
    let isSelected: boolean = false;

    if (
      this.movementsOfCancellations &&
      this.movementsOfCancellations.length > 0
    ) {
      for (let mov of this.movementsOfCancellations) {
        if (
          mov.transactionOrigin._id.toString() === transaction._id.toString()
        ) {
          isSelected = true;
        }
      }
    }

    return isSelected;
  }

  async finish() {
    try {
      this.loading = true;
      for (let mov of this.movementsOfCancellations) {
        if (
          this.roundNumber.transform(mov.balance) <=
            this.roundNumber.transform(mov.transactionOrigin.balance) ||
          !this.modifyBalance(mov.transactionOrigin)
        ) {
          for (const type of this.cancellationTypes) {
            if (type.origin._id === mov.transactionOrigin.type._id) {
              mov.type = type;
              if (mov.transactionOrigin.state != type.stateOrigin)
                await this.updateTransaction(
                  mov.transactionOrigin,
                  type.stateOrigin
                );
            }
          }
          if (
            mov.transactionOrigin.type &&
            mov.transactionOrigin.type.requestArticles &&
            mov.transactionDestination.type &&
            mov.transactionDestination.type.requestArticles
          ) {
            let movementsOfArticles: MovementOfArticle[] =
              await this.getMovementOfArticles(mov.transactionOrigin);
            for (let movementOfArticle of movementsOfArticles) {
              if (this.transactionDestination.type.groupsArticles) {
                let movement = this.existsMovementOfArticle(movementOfArticle);
                if (!movement) {
                  if (!this.movsOfArticles) this.movsOfArticles = new Array();
                  this.movsOfArticles.push(movementOfArticle);
                } else {
                  movement.amount += movementOfArticle.amount;
                  movement = this.recalculateMovArticle(
                    movement,
                    mov.transactionOrigin
                  );
                }
              } else {
                if (mov && mov.type && mov.type.updatePrices) {
                  if (
                    movementOfArticle.article &&
                    movementOfArticle.article.currency
                  ) {
                    movementOfArticle.salePrice =
                      movementOfArticle.article.salePrice *
                      movementOfArticle.article.currency.quotation;
                    movementOfArticle.costPrice =
                      movementOfArticle.article.costPrice *
                      movementOfArticle.article.currency.quotation;
                    movementOfArticle.unitPrice =
                      movementOfArticle.article.salePrice *
                      movementOfArticle.article.currency.quotation;
                  } else {
                    movementOfArticle.salePrice =
                      movementOfArticle.article.salePrice;
                    movementOfArticle.costPrice =
                      movementOfArticle.article.costPrice;
                    movementOfArticle.unitPrice =
                      movementOfArticle.article.salePrice;
                  }
                  this.movsOfArticles.push(movementOfArticle);
                } else {
                  this.movsOfArticles.push(movementOfArticle);
                }
              }
            }
          } else if (
            mov.transactionOrigin.commissionAmount > 0 ||
            mov.transactionOrigin.administrativeExpenseAmount > 0 ||
            mov.transactionOrigin.otherExpenseAmount > 0
          ) {
            let result: ApiResponse = await this._movementOfCashService
              .getAll({
                project: {
                  _id: 1,
                  transaction: 1,
                  commissionAmount: 1,
                  administrativeExpenseAmount: 1,
                  otherExpenseAmount: 1,
                  number: 1,
                  taxPercentage: 1,
                  'type._id': 1,
                  'type.name': 1,
                  'type.commissionArticle': 1,
                  'type.administrativeExpenseArticle': 1,
                  'type.otherExpenseArticle': 1,
                  operationType: 1,
                },
                match: {
                  transaction: { $oid: mov.transactionOrigin._id },
                  operationType: { $ne: 'D' },
                },
              })
              .toPromise();
            if (result.status !== 200) throw result;
            let movementsOfCashes: MovementOfCash[] = result.result;
            for (let movementOfCash of movementsOfCashes) {
              let movementOfArticle: MovementOfArticle;
              if (movementOfCash.commissionAmount > 0) {
                movementOfArticle =
                  await this.createMovementOfArticleByArticleId(
                    movementOfCash.type.commissionArticle.toString(),
                    movementOfCash.commissionAmount,
                    this.transactionDestination,
                    ` POR ${movementOfCash.type.name} ${
                      movementOfCash.number ? movementOfCash.number : ''
                    }`,
                    movementOfCash.taxPercentage > 0 ? true : false
                  );
              }

              if (movementOfCash.administrativeExpenseAmount > 0) {
                movementOfArticle =
                  await this.createMovementOfArticleByArticleId(
                    movementOfCash.type.administrativeExpenseArticle.toString(),
                    movementOfCash.administrativeExpenseAmount,
                    this.transactionDestination,
                    ` POR ${movementOfCash.type.name} ${
                      movementOfCash.number ? movementOfCash.number : ''
                    }`,
                    movementOfCash.taxPercentage > 0 ? true : false
                  );
              }

              if (movementOfCash.otherExpenseAmount > 0) {
                movementOfArticle =
                  await this.createMovementOfArticleByArticleId(
                    movementOfCash.type.otherExpenseArticle.toString(),
                    movementOfCash.otherExpenseAmount,
                    this.transactionDestination,
                    ` POR ${movementOfCash.type.name} ${
                      movementOfCash.number ? movementOfCash.number : ''
                    }`,
                    movementOfCash.taxPercentage > 0 ? true : false
                  );
              }
              if (movementOfArticle)
                this.movsOfArticles.push(movementOfArticle);
            }
          }
        } else
          throw new Error(
            'El saldo ingresado en la transacción ' +
              mov.transactionOrigin.type.name +
              ' ' +
              mov.transactionOrigin.number +
              ' no puede ser mayor que el saldo restante de la misma.'
          );
      }
      if (this.movsOfArticles && this.movsOfArticles.length !== 0) {
        await this.saveMovementsOfArticles(this.movsOfArticles);
      }
      this.loading = false;
      this.closeModal();
    } catch (error) {
      this._toastService.showToast(error);
    }
  }

  async createMovementOfArticleByArticleId(
    articleId: string,
    salePrice: number,
    transaction: Transaction,
    descriptionPlus?: string,
    calculaTax: boolean = true
  ) {
    return new Promise<MovementOfArticle>(async (resolve, reject) => {
      try {
        let article: Article = await this.getArticle(articleId);

        let increasePrice = 0;

        let movementOfArticle = new MovementOfArticle();
        movementOfArticle.article = article;
        movementOfArticle.code = article.code;
        movementOfArticle.codeSAT = article.codeSAT;
        movementOfArticle.description = article.description + descriptionPlus;
        movementOfArticle.observation = article.observation;
        movementOfArticle.make = article.make;
        movementOfArticle.category = article.category;
        movementOfArticle.barcode = article.barcode;
        movementOfArticle.transaction = transaction;
        movementOfArticle.modifyStock = transaction.type.modifyStock;
        movementOfArticle.otherFields = article.otherFields;
        movementOfArticle.amount = 1;
        movementOfArticle.stockMovement = transaction.type.stockMovement;
        movementOfArticle.op = Date.now() + Math.floor(Math.random() * 100000);

        let quotation = 1;
        if (transaction.quotation) {
          quotation = transaction.quotation;
        }

        movementOfArticle.basePrice = this.roundNumber.transform(
          article.basePrice
        );

        if (
          article.currency &&
          Config.currency &&
          Config.currency._id !== article.currency._id
        ) {
          movementOfArticle.basePrice = this.roundNumber.transform(
            movementOfArticle.basePrice * quotation
          );
        }

        if (
          transaction &&
          transaction.type &&
          transaction.type.transactionMovement === TransactionMovement.Sale
        ) {
          let fields: ArticleFields[] = new Array();
          if (
            movementOfArticle.otherFields &&
            movementOfArticle.otherFields.length > 0
          ) {
            for (const field of movementOfArticle.otherFields) {
              if (
                field.articleField.datatype === ArticleFieldType.Percentage ||
                field.articleField.datatype === ArticleFieldType.Number
              ) {
                if (
                  field.articleField.datatype === ArticleFieldType.Percentage
                ) {
                  field.amount = this.roundNumber.transform(
                    (movementOfArticle.basePrice * parseFloat(field.value)) /
                      100
                  );
                } else if (
                  field.articleField.datatype === ArticleFieldType.Number
                ) {
                  field.amount = parseFloat(field.value);
                }
              }
              fields.push(field);
            }
          }

          movementOfArticle.otherFields = fields;
          movementOfArticle.costPrice = this.roundNumber.transform(
            article.costPrice
          );
          movementOfArticle.markupPercentage = article.markupPercentage;
          movementOfArticle.markupPrice = this.roundNumber.transform(
            article.markupPrice
          );
          if (salePrice) article.salePrice = salePrice;
          movementOfArticle.unitPrice = this.roundNumber.transform(
            article.salePrice / movementOfArticle.amount
          );
          movementOfArticle.salePrice = this.roundNumber.transform(
            article.salePrice
          );

          if (
            article.currency &&
            Config.currency &&
            Config.currency._id !== article.currency._id
          ) {
            movementOfArticle.unitPrice = this.roundNumber.transform(
              movementOfArticle.salePrice * quotation
            );
            movementOfArticle.salePrice = this.roundNumber.transform(
              movementOfArticle.salePrice * quotation
            );
          }

          if (increasePrice != 0) {
            movementOfArticle.markupPrice = this.roundNumber.transform(
              movementOfArticle.markupPrice +
                (movementOfArticle.markupPrice * increasePrice) / 100
            );
            movementOfArticle.unitPrice = this.roundNumber.transform(
              movementOfArticle.unitPrice +
                (movementOfArticle.unitPrice * increasePrice) / 100
            );
            movementOfArticle.salePrice = this.roundNumber.transform(
              movementOfArticle.salePrice +
                (movementOfArticle.salePrice * increasePrice) / 100
            );
          }

          if (transaction.type.requestTaxes && calculaTax) {
            let taxes: Taxes[] = new Array();
            if (article.taxes) {
              for (let taxAux of article.taxes) {
                let tax: Taxes = new Taxes();
                if (taxAux.tax && taxAux.tax._id) {
                  tax.tax = taxAux.tax;
                }
                tax.percentage = this.roundNumber.transform(taxAux.percentage);
                tax.taxAmount = this.roundNumber.transform(
                  taxAux.taxAmount * movementOfArticle.amount
                );
                tax.taxBase = this.roundNumber.transform(
                  taxAux.taxBase * movementOfArticle.amount
                );
                taxes.push(tax);
              }
            }
            movementOfArticle.taxes = taxes;
          }
        } else {
          movementOfArticle.markupPercentage = 0;
          movementOfArticle.markupPrice = 0;

          let taxedAmount = movementOfArticle.basePrice;
          movementOfArticle.costPrice = 0;

          let fields: ArticleFields[] = new Array();
          if (
            movementOfArticle.otherFields &&
            movementOfArticle.otherFields.length > 0
          ) {
            for (const field of movementOfArticle.otherFields) {
              if (
                field.articleField.datatype === ArticleFieldType.Percentage ||
                field.articleField.datatype === ArticleFieldType.Number
              ) {
                if (
                  field.articleField.datatype === ArticleFieldType.Percentage
                ) {
                  field.amount = this.roundNumber.transform(
                    (movementOfArticle.basePrice * parseFloat(field.value)) /
                      100
                  );
                } else if (
                  field.articleField.datatype === ArticleFieldType.Number
                ) {
                  field.amount = parseFloat(field.value);
                }
                if (field.articleField.modifyVAT) {
                  taxedAmount += field.amount;
                } else {
                  movementOfArticle.costPrice += field.amount;
                }
              }
              fields.push(field);
            }
          }
          movementOfArticle.otherFields = fields;
          if (transaction.type.requestTaxes && calculaTax) {
            let taxes: Taxes[] = new Array();
            if (article.taxes) {
              for (let taxAux of article.taxes) {
                if (taxAux.tax && taxAux.tax._id) {
                  taxAux.tax = taxAux.tax;
                }
                taxAux.taxBase = this.roundNumber.transform(taxedAmount);
                if (taxAux.percentage !== 0) {
                  taxAux.taxAmount = this.roundNumber.transform(
                    (taxAux.taxBase * taxAux.percentage) / 100
                  );
                }
                taxes.push(taxAux);
                movementOfArticle.costPrice += taxAux.taxAmount;
              }
              movementOfArticle.taxes = taxes;
            }
          }
          movementOfArticle.costPrice +=
            this.roundNumber.transform(taxedAmount);
          movementOfArticle.unitPrice = movementOfArticle.basePrice;
          movementOfArticle.salePrice = movementOfArticle.costPrice;
        }
        resolve(movementOfArticle);
      } catch (error) {
        reject(error);
      }
    });
  }

  public getArticle(articleId: string): Promise<Article> {
    return new Promise<Article>((resolve, reject) => {
      this._articleService.getArticle(articleId).subscribe(
        (result) => {
          if (!result.article) {
            if (result.message && result.message !== '')
              this._toastService.showToast({
                type: 'info',
                message: result.message,
              });
            resolve(null);
          } else {
            resolve(result.article);
          }
        },
        (error) => {
          this._toastService.showToast({
            type: 'danger',
            message: error._body,
          });
          resolve(null);
        }
      );
    });
  }

  public existsMovementOfArticle(
    movementOfArticle: MovementOfArticle
  ): MovementOfArticle {
    let movement: MovementOfArticle;
    if (this.movsOfArticles && this.movsOfArticles.length > 0) {
      for (let mov of this.movsOfArticles) {
        if (
          movementOfArticle.article &&
          mov.article &&
          mov.article._id === movementOfArticle.article._id &&
          mov.salePrice === movementOfArticle.salePrice
        )
          movement = mov;
      }
    }
    return movement;
  }

  public updateTransaction(
    transaction: Transaction,
    status: TransactionState
  ): Promise<Transaction> {
    return new Promise<Transaction>((resolve, reject) => {
      transaction.state = status;
      this._transactionService.update(transaction).subscribe(
        (result: ApiResponse) => {
          if (result.status === 200) {
            resolve(result.result);
          } else {
            this._toastService.showToast(result);
            reject(result);
          }
        },
        (error) => {
          this._toastService.showToast(error);
          reject(error);
        }
      );
    });
  }

  async getMovementOfArticles(
    transaction: Transaction
  ): Promise<MovementOfArticle[]> {
    return new Promise<MovementOfArticle[]>(async (resolve, reject) => {
      try {
        let movements: MovementOfArticle[] = new Array();
        let query = 'where="transaction":"' + transaction._id + '"';
        await this._movementOfArticleService
          .getMovementsOfArticles(query)
          .toPromise()
          .then(async (result) => {
            if (result.movementsOfArticles) {
              for (let mov of result.movementsOfArticles) {
                let movementOfArticle = new MovementOfArticle();

                movementOfArticle.movementParent = mov.movementParent;
                movementOfArticle.code = mov.code;
                movementOfArticle.codeSAT = mov.codeSAT;
                movementOfArticle.description = mov.description;
                movementOfArticle.observation = mov.observation;
                movementOfArticle.otherFields = mov.otherFields;
                if (mov.make && mov.make._id && mov.make._id !== '') {
                  movementOfArticle.make = mov.make._id;
                } else {
                  movementOfArticle.make = mov.make;
                }
                if (
                  mov.category &&
                  mov.category._id &&
                  mov.category._id !== ''
                ) {
                  movementOfArticle.category = mov.category._id;
                } else {
                  movementOfArticle.category = mov.category;
                }
                movementOfArticle.amount = mov.amount;
                movementOfArticle.quantityForStock = 0;
                movementOfArticle.barcode = mov.barcode;
                movementOfArticle.notes = mov.notes;
                movementOfArticle.printed = mov.printed;
                movementOfArticle.printIn = mov.printIn;
                movementOfArticle.article = mov.article;
                movementOfArticle.transaction = new Transaction();
                movementOfArticle.transaction._id =
                  this.transactionDestination._id;
                movementOfArticle.modifyStock =
                  this.transactionDestination.type.modifyStock;
                movementOfArticle.stockMovement =
                  this.transactionDestination.type.stockMovement;
                movementOfArticle.op =
                  Date.now() + Math.floor(Math.random() * 100000);

                movementOfArticle.measure = mov.measure;
                movementOfArticle.quantityMeasure = mov.quantityMeasure;

                movementOfArticle.basePrice = mov.basePrice;

                if (
                  this.transactionDestination.type.requestTaxes &&
                  !transaction.type.requestTaxes
                ) {
                  movementOfArticle.costPrice = mov.costPrice;
                  movementOfArticle.salePrice = mov.salePrice;
                  let taxes: Taxes[] = new Array();
                  if (
                    movementOfArticle.article &&
                    movementOfArticle.article.taxes &&
                    movementOfArticle.article.taxes.length > 0
                  ) {
                    for (let taxAux of movementOfArticle.article.taxes) {
                      let tax: Taxes = new Taxes();
                      tax.percentage = this.roundNumber.transform(
                        taxAux.percentage
                      );
                      tax.tax = taxAux.tax;
                      if (tax.tax.taxBase == TaxBase.Neto) {
                        tax.taxBase = this.roundNumber.transform(
                          movementOfArticle.salePrice
                        );
                      }
                      if (tax.percentage === 0) {
                        tax.taxAmount = this.roundNumber.transform(
                          tax.taxAmount * movementOfArticle.amount
                        );
                      } else {
                        tax.taxAmount = this.roundNumber.transform(
                          (tax.taxBase * tax.percentage) / 100
                        );
                      }
                      movementOfArticle.salePrice += tax.taxAmount;
                      taxes.push(tax);
                    }
                  }
                  movementOfArticle.taxes = taxes;

                  movementOfArticle.unitPrice =
                    movementOfArticle.salePrice / movementOfArticle.amount;
                  movementOfArticle.markupPrice = this.roundNumber.transform(
                    movementOfArticle.salePrice - movementOfArticle.costPrice
                  );
                  movementOfArticle.markupPercentage =
                    this.roundNumber.transform(
                      (movementOfArticle.markupPrice /
                        movementOfArticle.costPrice) *
                        100,
                      3
                    );
                  movementOfArticle.roundingAmount = mov.roundingAmount;
                } else {
                  if (
                    this.transactionDestination.type.requestTaxes &&
                    transaction.type.requestTaxes
                  ) {
                    movementOfArticle.taxes = mov.taxes;
                  }
                  movementOfArticle.costPrice = mov.costPrice;
                  movementOfArticle.unitPrice = mov.unitPrice;
                  movementOfArticle.markupPercentage = mov.markupPercentage;
                  movementOfArticle.markupPrice = mov.markupPrice;
                  movementOfArticle.salePrice = mov.salePrice;
                  movementOfArticle.roundingAmount = mov.roundingAmount;
                }
                if (
                  this.transactionDestination.type.transactionMovement ===
                  TransactionMovement.Sale
                ) {
                  movementOfArticle =
                    this.recalculateSalePrice(movementOfArticle);
                } else {
                  movementOfArticle =
                    this.recalculateCostPrice(movementOfArticle);
                }
                movements.push(movementOfArticle);
              }
            } else reject(result);
          });
        resolve(movements);
      } catch (error) {
        reject(error);
      }
    });
  }

  public recalculateMovArticle(
    mov: MovementOfArticle,
    transaction: Transaction
  ): MovementOfArticle {
    let movementOfArticle = new MovementOfArticle();

    movementOfArticle.transaction = this.transactionDestination;
    movementOfArticle.article = mov.article;
    movementOfArticle.code = mov.code;
    movementOfArticle.codeSAT = mov.codeSAT;
    movementOfArticle.description = mov.description;
    movementOfArticle.observation = mov.observation;
    movementOfArticle.otherFields = mov.otherFields;
    movementOfArticle.make = mov.make;
    movementOfArticle.category = mov.category;
    movementOfArticle.op = Date.now() + Math.floor(Math.random() * 100000);

    movementOfArticle.costPrice = mov.costPrice;
    movementOfArticle.salePrice = mov.salePrice;
    let taxes: Taxes[] = new Array();
    if (
      movementOfArticle.article &&
      movementOfArticle.article.taxes &&
      movementOfArticle.article.taxes.length > 0
    ) {
      for (let taxAux of movementOfArticle.article.taxes) {
        let tax: Taxes = new Taxes();
        tax.percentage = this.roundNumber.transform(taxAux.percentage);
        tax.tax = taxAux.tax;
        if (tax.tax.taxBase == TaxBase.Neto) {
          tax.taxBase = this.roundNumber.transform(movementOfArticle.salePrice);
        }
        if (tax.percentage === 0) {
          tax.taxAmount = this.roundNumber.transform(
            tax.taxAmount * movementOfArticle.amount
          );
        } else {
          tax.taxAmount = this.roundNumber.transform(
            (tax.taxBase * tax.percentage) / 100
          );
        }
        movementOfArticle.salePrice += tax.taxAmount;
        taxes.push(tax);
      }
    }
    movementOfArticle.taxes = taxes;

    movementOfArticle.unitPrice =
      movementOfArticle.salePrice / movementOfArticle.amount;
    movementOfArticle.markupPrice = this.roundNumber.transform(
      movementOfArticle.salePrice - movementOfArticle.costPrice
    );
    movementOfArticle.markupPercentage = this.roundNumber.transform(
      (movementOfArticle.markupPrice / movementOfArticle.costPrice) * 100,
      3
    );
    movementOfArticle.roundingAmount = mov.roundingAmount;
    if (
      this.transactionDestination.type.requestTaxes &&
      transaction.type.requestTaxes
    ) {
      movementOfArticle.taxes = mov.taxes;
    } else {
      movementOfArticle.costPrice = mov.costPrice;
      movementOfArticle.unitPrice = mov.unitPrice;
      movementOfArticle.markupPercentage = mov.markupPercentage;
      movementOfArticle.markupPrice = mov.markupPrice;
      movementOfArticle.salePrice = mov.salePrice;
      movementOfArticle.roundingAmount = mov.roundingAmount;
    }
    if (
      this.transactionDestination.type.transactionMovement ===
      TransactionMovement.Sale
    ) {
      movementOfArticle = this.recalculateSalePrice(movementOfArticle);
    } else {
      movementOfArticle = this.recalculateCostPrice(movementOfArticle);
    }

    return movementOfArticle;
  }

  public recalculateCostPrice(
    movementOfArticle: MovementOfArticle
  ): MovementOfArticle {
    let quotation = 1;

    if (this.transactionDestination.quotation) {
      quotation = movementOfArticle.transaction.quotation;
    }

    // ADVERTENCIA, EL UNIT PRICE NO SE RECALCULA CON EL DESCUENTO DE LA transaction PARA QUE EL DESCUENTO DE LA transaction CANCELADA PASE A LA transaction CANCELATORIA
    movementOfArticle.basePrice = this.roundNumber.transform(
      movementOfArticle.unitPrice * movementOfArticle.amount
    );
    movementOfArticle.markupPrice = 0.0;
    movementOfArticle.markupPercentage = 0.0;

    let taxedAmount = movementOfArticle.basePrice;
    movementOfArticle.costPrice = 0;

    let fields: ArticleFields[] = new Array();
    if (
      movementOfArticle.otherFields &&
      movementOfArticle.otherFields.length > 0
    ) {
      for (const field of movementOfArticle.otherFields) {
        if (
          field.articleField.datatype === ArticleFieldType.Percentage ||
          field.articleField.datatype === ArticleFieldType.Number
        ) {
          if (field.articleField.datatype === ArticleFieldType.Percentage) {
            field.amount = this.roundNumber.transform(
              (movementOfArticle.basePrice * parseFloat(field.value)) / 100
            );
          } else if (field.articleField.datatype === ArticleFieldType.Number) {
            field.amount = parseFloat(field.value);
          }
          if (field.articleField.modifyVAT) {
            taxedAmount += field.amount;
          } else {
            movementOfArticle.costPrice += field.amount;
          }
        }
        fields.push(field);
      }
    }
    movementOfArticle.otherFields = fields;
    if (this.transactionDestination.type.requestTaxes) {
      if (
        movementOfArticle.article &&
        movementOfArticle.article.taxes &&
        movementOfArticle.article.taxes.length > 0
      ) {
        let taxes: Taxes[] = new Array();
        for (let articleTax of movementOfArticle.taxes) {
          if (articleTax.tax.taxBase === TaxBase.Neto) {
            articleTax.taxBase = taxedAmount;
          } else {
            articleTax.taxBase = 0;
          }
          if (articleTax.percentage === 0) {
            for (let artTax of movementOfArticle.article.taxes) {
              if (artTax.tax._id === articleTax.tax._id) {
                articleTax.taxAmount = this.roundNumber.transform(
                  artTax.taxAmount * movementOfArticle.amount
                );
              }
            }
          } else {
            articleTax.taxAmount = this.roundNumber.transform(
              (articleTax.taxBase * articleTax.percentage) / 100
            );
          }
          taxes.push(articleTax);
          movementOfArticle.costPrice += articleTax.taxAmount;
        }
        movementOfArticle.taxes = taxes;
      }
    }
    movementOfArticle.costPrice += this.roundNumber.transform(taxedAmount);
    movementOfArticle.salePrice =
      movementOfArticle.costPrice + movementOfArticle.roundingAmount;

    return movementOfArticle;
  }

  // EL IMPUESTO VA SOBRE EL ARTICULO Y NO SOBRE EL MOVIMIENTO
  public recalculateSalePrice(
    movementOfArticle: MovementOfArticle
  ): MovementOfArticle {
    let quotation = 1;
    if (this.transactionDestination.quotation) {
      quotation = this.transactionDestination.quotation;
    }

    if (movementOfArticle.article) {
      movementOfArticle.basePrice = this.roundNumber.transform(
        movementOfArticle.article.basePrice * movementOfArticle.amount
      );

      if (
        movementOfArticle.article.currency &&
        Config.currency &&
        Config.currency._id !== movementOfArticle.article.currency._id
      ) {
        movementOfArticle.basePrice = this.roundNumber.transform(
          movementOfArticle.basePrice * quotation
        );
      }
    }

    let fields: ArticleFields[] = new Array();
    if (
      movementOfArticle.otherFields &&
      movementOfArticle.otherFields.length > 0
    ) {
      for (const field of movementOfArticle.otherFields) {
        if (
          field.articleField.datatype === ArticleFieldType.Percentage ||
          field.articleField.datatype === ArticleFieldType.Number
        ) {
          if (field.articleField.datatype === ArticleFieldType.Percentage) {
            field.amount = this.roundNumber.transform(
              (movementOfArticle.basePrice * parseFloat(field.value)) / 100
            );
          } else if (field.articleField.datatype === ArticleFieldType.Number) {
            field.amount = parseFloat(field.value);
          }
        }
        fields.push(field);
      }
    }
    movementOfArticle.otherFields = fields;

    if (movementOfArticle.article) {
      movementOfArticle.costPrice = this.roundNumber.transform(
        movementOfArticle.article.costPrice * movementOfArticle.amount
      );

      if (
        movementOfArticle.article.currency &&
        Config.currency &&
        Config.currency._id !== movementOfArticle.article.currency._id
      ) {
        movementOfArticle.costPrice = this.roundNumber.transform(
          movementOfArticle.costPrice * quotation
        );
      }
    }

    // ADVERTENCIA, EL UNIT PRICE NO SE RECALCULA CON EL DESCUENTO DE LA transaction PARA QUE EL DESCUENTO DE LA transaction CANCELADA PASE A LA transaction CANCELATORIA
    movementOfArticle.salePrice = this.roundNumber.transform(
      movementOfArticle.unitPrice * movementOfArticle.amount
    );
    movementOfArticle.markupPrice = this.roundNumber.transform(
      movementOfArticle.salePrice - movementOfArticle.costPrice
    );
    movementOfArticle.markupPercentage = this.roundNumber.transform(
      (movementOfArticle.markupPrice / movementOfArticle.costPrice) * 100,
      3
    );

    if (this.transactionDestination.type.requestTaxes) {
      let taxes: Taxes[] = new Array();
      if (
        movementOfArticle.article &&
        movementOfArticle.article.taxes &&
        movementOfArticle.article.taxes.length > 0
      ) {
        let impInt: number = 0;
        for (let taxAux of movementOfArticle.article.taxes) {
          if (taxAux.percentage === 0) {
            impInt = this.roundNumber.transform(
              taxAux.taxAmount * movementOfArticle.amount
            );
          }
        }
        for (let taxAux of movementOfArticle.article.taxes) {
          let tax: Taxes = new Taxes();
          tax.percentage = this.roundNumber.transform(taxAux.percentage);
          tax.tax = taxAux.tax;
          if (tax.percentage === 0) {
            tax.taxAmount = impInt;
            tax.taxBase = 0;
          } else {
            tax.taxBase = this.roundNumber.transform(
              (movementOfArticle.salePrice - impInt) /
                (tax.percentage / 100 + 1),
              4
            );
            tax.taxAmount = this.roundNumber.transform(
              (tax.taxBase * tax.percentage) / 100,
              4
            );
          }
          taxes.push(tax);
        }
      }
      movementOfArticle.taxes = taxes;
    }

    return movementOfArticle;
  }

  public refresh(): void {
    this.getCancellationTypes();
  }

  public closeModal(): void {
    if (this.areValidMovements()) {
      this.activeModal.close({
        movementsOfCancellations: this.movementsOfCancellations,
        movementsOfCashes: this.movementsOfCashes,
      });
    }
  }

  public areValidMovements(): boolean {
    let areValid: boolean = true;
    let totalBalance = 0;
    for (let mov of this.movementsOfCancellations) {
      if (!mov['saved'])
        totalBalance += this.roundNumber.transform(mov.balance);
    }
    if (
      this.totalPrice !== 0 &&
      this.totalPrice < this.roundNumber.transform(totalBalance)
    ) {
      areValid = false;
      this._toastService.showToast({
        message:
          'El saldo seleccionado de las transacciones no puede ser distinto del monto de la transacción ($ ' +
          this.totalPrice +
          ')',
        type: 'info',
      });
    }
    return areValid;
  }

  public updateBalanceOrigin(transaction: Transaction): void {
    if (transaction['balanceSelected'] <= transaction.balance) {
      for (let mov of this.movementsOfCancellations) {
        if (
          mov.transactionOrigin._id.toString() === transaction._id.toString()
        ) {
          mov.balance = this.roundNumber.transform(
            transaction['balanceSelected']
          );
        }
      }
      this.recalculateBalanceSelected();
    } else {
      this._toastService.showToast({
        message: `El saldo ingresado no puede ser mayor al saldo de la transacción (${transaction.balance}).`,
        type: 'info',
      });
      transaction['balanceSelected'] = this.roundNumber.transform(
        transaction.balance
      );
    }
  }

  public saveMovementsOfArticles(
    movemenstOfarticles: MovementOfArticle[]
  ): Promise<MovementOfArticle[]> {
    return new Promise((resolve, reject) => {
      try {
        this._movementOfArticleService
          .saveMovementsOfArticles(movemenstOfarticles)
          .subscribe(
            (result) => {
              if (result.movementsOfArticles) {
                resolve(result.movementsOfArticles);
              } else reject(result);
            },
            (error) => reject(error)
          );
      } catch (error) {
        reject(error);
      }
    });
  }
}
