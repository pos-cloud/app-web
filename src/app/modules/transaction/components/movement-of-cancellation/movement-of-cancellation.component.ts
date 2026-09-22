import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ArticleService } from '@core/services/article.service';
import { CancellationTypeService } from '@core/services/cancellation-type.service';
import { MovementOfArticleService } from '@core/services/movement-of-article.service';
import { MovementOfCancellationService } from '@core/services/movement-of-cancellation.service';
import { MovementOfCashService } from '@core/services/movement-of-cash.service';
import { TransactionService } from '@core/services/transaction.service';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ProgressbarModule } from '@shared/components/progressbar/progressbar.module';
import { ToastService } from '@shared/components/toast/toast.service';
import { FocusDirective } from '@shared/directives/focus.directive';
import { PipesModule } from '@shared/pipes/pipes.module';
import { RoundNumberPipe } from '@shared/pipes/round-number.pipe';
import {
  ApiResponse,
  CancellationType,
  MovementOfCancellation,
  MovementOfCash,
  Movements,
  TaxBase,
  Taxes,
  Transaction,
  TransactionMovement,
  TransactionState,
} from '@types';
import { Config } from 'app/app.config';
import { Article } from 'app/components/article/article';
import { MovementOfArticle } from 'app/components/movement-of-article/movement-of-article';
import { SelectMovementsOfCashesComponent } from 'app/components/movement-of-cash/select-movements-of-cashes/select-movements-of-cashes.component';
import { ViewTransactionComponent } from 'app/modules/transaction/components/view-transaction/view-transaction.component';
import { firstValueFrom, Subject, takeUntil } from 'rxjs';

type TransactionRow = Transaction & {
  balanceSelected?: number;
  isFinanced?: boolean;
};

type CancellationRow = MovementOfCancellation & {
  saved?: boolean;
};

@Component({
  selector: 'app-movement-of-cancellation',
  templateUrl: './movement-of-cancellation.component.html',
  styleUrls: ['./movement-of-cancellation.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, PipesModule, FocusDirective, ProgressbarModule],
})
export class MovementOfCancellationComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() transactionDestinationId!: string;
  @Input() transactionDestinationViewId!: string;
  @Input() transactionOriginViewId!: string;
  @Input() totalPrice: number = 0;
  @Input() selectionView: boolean = false;
  @Input() movementsOfCancellations: CancellationRow[] = [];
  @Input() movementsOfCashes: MovementOfCash[] = [];

  focusEvent = new EventEmitter<boolean>();
  movsOfArticles: MovementOfArticle[] = [];
  transactionDestination!: Transaction;
  requestCompany: boolean = false;
  transactions: TransactionRow[] = [];
  cancellationTypes: CancellationType[] = [];
  loading: boolean = false;
  totalItems: number = -1;
  orderTerm: string[] = ['endDate'];
  filters: Record<string, string> = {};
  roundNumber = new RoundNumberPipe();
  userCountry: string;
  balanceSelected: number = 0;
  automaticSelectionReady: boolean = false;
  displayedColumns = [
    '_id',
    'endDate',
    'origin',
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
    'company.name',
    'company.group.description',
  ];

  private destroy$ = new Subject<void>();

  constructor(
    private _cancellationTypeService: CancellationTypeService,
    private _movementOfCancellationService: MovementOfCancellationService,
    private _transactionService: TransactionService,
    private _movementOfCashService: MovementOfCashService,
    private _movementOfArticleService: MovementOfArticleService,
    private _articleService: ArticleService,
    private _toastService: ToastService,
    public activeModal: NgbActiveModal,
    public _modalService: NgbModal
  ) {
    this.userCountry = Config.country;
    for (const field of this.displayedColumns) {
      this.filters[field] = '';
    }
  }

  async ngOnInit() {
    this.loading = true;
    if (this.transactionDestinationViewId || this.transactionOriginViewId) {
      this.getCancellationsOfMovements();
    } else {
      const transaction = await this.getTransaction(this.transactionDestinationId);
      if (transaction) {
        this.transactionDestination = transaction;
        this.getCancellationTypes();
      } else {
        this.loading = false;
      }
    }
  }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getCancellationsOfMovements() {
    this.loading = true;

    const match = this.transactionOriginViewId
      ? {
          transactionOrigin: { $oid: this.transactionOriginViewId },
          operationType: { $ne: 'D' },
        }
      : {
          transactionDestination: { $oid: this.transactionDestinationViewId },
          operationType: { $ne: 'D' },
        };

    this._movementOfCancellationService
      .getAll({
        project: {
          balance: 1,
          transactionOrigin: 1,
          transactionDestination: 1,
          operationType: 1,
        },
        match,
        sort: { order: 1 },
      })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: async (result: ApiResponse) => {
          const movements = result?.result ?? [];
          if (movements.length > 0) {
            const loaded: TransactionRow[] = [];
            for (const movement of movements) {
              const related = this.transactionOriginViewId
                ? movement.transactionDestination
                : movement.transactionOrigin;
              const transaction = await this.getTransaction(this.getEntityId(related));
              if (
                transaction &&
                transaction.state !== TransactionState.Open &&
                transaction.state !== TransactionState.Pending
              ) {
                transaction.balance = this.roundNumber.transform(movement.balance);
                loaded.push(transaction);
              }
            }
            this.transactions = loaded;
            this.totalItems = loaded.length;
          } else {
            this._toastService.showToast({
              type: 'danger',
              message: 'No se encontraron transactiones relacionadas',
            });
            this.transactions = [];
            this.totalItems = 0;
          }
          this.loading = false;
        },
        error: (error) => {
          this._toastService.showToast(error);
          this.totalItems = 0;
          this.loading = false;
        },
      });
  }

  async getTransaction(transactionId: string | null): Promise<Transaction | null> {
    if (!transactionId) {
      this.totalItems = 0;
      return null;
    }

    try {
      const result: ApiResponse = await firstValueFrom(this._transactionService.getById(transactionId));
      if (result?.status === 200 && result.result) {
        return result.result;
      }
      this.totalItems = 0;
      return null;
    } catch (error) {
      this._toastService.showToast(error);
      this.totalItems = 0;
      return null;
    }
  }

  getCancellationTypes(): void {
    this.loading = true;

    this._cancellationTypeService
      .getAll({
        project: {
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
        },
        match: {
          'destination._id': { $oid: this.transactionDestination.type._id },
          origin: { $exists: true },
          operationType: { $ne: 'D' },
        },
      })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: ApiResponse) => {
          const cancellationTypes = result?.result ?? [];
          if (cancellationTypes.length > 0) {
            this.cancellationTypes = cancellationTypes;
            this.getTransactions();
            return;
          }
          this.totalItems = 0;
          this.loading = false;
        },
        error: (error) => {
          this._toastService.showToast(error);
          this.totalItems = 0;
          this.loading = false;
        },
      });
  }

  async getTransactions() {
    this.loading = true;

    let sortAux;
    if (this.orderTerm[0].charAt(0) === '-') {
      sortAux = `{ "${this.orderTerm[0].split('-')[1]}" : -1 }`;
    } else {
      sortAux = `{ "${this.orderTerm[0]}" : 1 }`;
    }
    sortAux = JSON.parse(sortAux);

    let match = `{`;
    for (let i = 0; i < this.displayedColumns.length; i++) {
      const value = this.filters[this.displayedColumns[i]];
      if (value && value != '') {
        match += `"${this.displayedColumns[i]}": { "$regex": "${value}", "$options": "i"}`;
        match += ',';
      }
    }
    match += `"$or": [`;

    this.requestCompany = false;
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
    } else {
      this.requestCompany = false;
    }

    match += `"operationType": { "$ne": "D" }, "balance": { "$gt": 0 } }`;
    match = JSON.parse(match);

    let timezone = '-03:00';
    if (Config.timezone && Config.timezone !== '') {
      timezone = Config.timezone.split('UTC')[1];
    }

    const project = {
      _id: 1,
      endDate: {
        $dateToString: {
          date: '$endDate',
          format: '%d/%m/%Y',
          timezone: timezone,
        },
      },
      origin: 1,
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
      'company.name': 1,
      'company.group.description': 1,
      'type._id': { $toString: '$type._id' },
      'type.name': 1,
      'type.requestArticles': 1,
      'type.requestPaymentMethods': 1,
      'type.movement': 1,
    };

    this._transactionService
      .getAll({
        project,
        match,
        sort: sortAux,
      })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: async (result: ApiResponse) => {
          try {
            const transactions = result?.result ?? [];
            if (transactions.length > 0) {
              for (const transaction of transactions) {
                if (!transaction.type.requestArticles && transaction.type.requestPaymentMethods) {
                  const movementsOfCashes = await this.getMovementsOfCashes(transaction._id);
                  transaction.isFinanced = movementsOfCashes?.some((mov) => mov.type.allowToFinance) ?? false;
                }
              }

              this.transactions = transactions;
              this.totalItems = transactions.length;

              if (this.totalPrice > 0 && this.balanceSelected === 0) {
                if (this.movementsOfCancellations && this.movementsOfCancellations.length > 0) {
                  for (const transaction of this.transactions) {
                    for (const mov of this.movementsOfCancellations) {
                      if (this.getEntityId(mov.transactionOrigin) === this.getEntityId(transaction)) {
                        transaction.balanceSelected = this.roundNumber.transform(transaction.balance);
                      }
                    }
                  }
                  this.recalculateBalanceSelected();
                } else {
                  this.movementsOfCancellations = [];
                  if (!this.automaticSelectionReady && this.cancellationTypes[0].automaticSelection) {
                    this.selectAutomatically();
                  }
                }
              } else if (
                this.totalPrice === 0 &&
                this.balanceSelected === 0 &&
                !this.automaticSelectionReady &&
                this.cancellationTypes[0].automaticSelection
              ) {
                this.movementsOfCancellations = [];
                this.selectAutomatically();
              }
            } else {
              this.transactions = [];
              this.totalItems = 0;
            }
          } finally {
            this.loading = false;
          }
        },
        error: (error) => {
          this._toastService.showToast(error);
          this.loading = false;
          this.totalItems = 0;
        },
      });
  }

  async getMovementsOfCashes(transactionId: string): Promise<MovementOfCash[]> {
    try {
      const result: ApiResponse = await firstValueFrom(
        this._movementOfCashService.getAll({
          project: {
            _id: 1,
            'type.allowToFinance': 1,
            operationType: 1,
            transaction: 1,
          },
          match: {
            transaction: { $oid: transactionId },
            operationType: { $ne: 'D' },
          },
        })
      );
      return result?.result ?? [];
    } catch (error) {
      return [];
    }
  }

  async getMovementsOfCancellations(): Promise<CancellationRow[] | null> {
    try {
      const result: ApiResponse = await firstValueFrom(
        this._movementOfCancellationService.getAll({
          project: {
            _id: 0,
            'transactionOrigin._id': 1,
            'transactionDestination._id': 1,
            'transactionDestination.type.groupsArticles': 1,
            balance: 1,
            operationType: 1,
            'transactionOrigin.type.name': 1,
            'transactionOrigin.type.movement': 1,
            'transactionOrigin.type.transactionMovement': 1,
            'transactionOrigin.type.electronics': 1,
            'transactionOrigin.number': 1,
            'transactionOrigin.operationType': 1,
            'transactionOrigin.balance': 1,
          },
          match: {
            'transactionDestination._id': {
              $oid: this.transactionDestination._id,
            },
            operationType: { $ne: 'D' },
            'transactionOrigin.operationType': { $ne: 'D' },
          },
        })
      );
      return result?.result?.length ? result.result : null;
    } catch (error) {
      this._toastService.showToast(error);
      return null;
    }
  }

  async selectAutomatically() {
    this.automaticSelectionReady = true;
    if (this.totalPrice > 0) {
      for (const transaction of this.transactions) {
        if (this.totalPrice > this.balanceSelected) {
          await this.selectTransaction(transaction, true);
          this.recalculateBalanceSelected();
        }
      }
    } else if (this.totalPrice === 0) {
      for (const transaction of this.transactions) {
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
                for (const mov of result.movementsOfCashes) {
                  balance += mov.balanceCanceled;
                }
                await this.selectTransaction(transaction, false, balance);
                this.updateBalanceOrigin(transaction);
                this.assignMovementsOfCashes(result.movementsOfCashes);
                this.recalculateBalanceSelected();
              }
            },
            () => {}
          );
        }
        break;
    }
  }

  assignMovementsOfCashes(movs: MovementOfCash[]) {
    for (const mov of movs) {
      let exists: boolean = false;
      for (const m of this.movementsOfCashes) {
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
    balanceSelected: number | null = null,
    cancelForTotal: boolean = true
  ) {
    const selectedTransaction = await this.getTransaction(transactionSelected._id);
    if (!selectedTransaction) return;
    transactionSelected = selectedTransaction;
    let isValid: boolean = true;

    if (this.isTransactionSelected(transactionSelected)) {
      if (!automatic) this.deleteTransactionSelected(transactionSelected);
    } else {
      const movementOfCancellation = {
        transactionOrigin: transactionSelected,
        transactionDestination: this.transactionDestination,
        balance: 0,
      } as MovementOfCancellation;
      if (this.modifyBalance(transactionSelected)) {
        let transBalance = 0;
        if (
          (transactionSelected.type.transactionMovement === TransactionMovement.Sale &&
            transactionSelected.type.movement === Movements.Outflows) ||
          (transactionSelected.type.transactionMovement === TransactionMovement.Purchase &&
            transactionSelected.type.movement === Movements.Inflows) ||
          transactionSelected.type._id === this.transactionDestination.type._id
        ) {
          if (balanceSelected) {
            transBalance = balanceSelected * -1;
          } else {
            transBalance = transactionSelected.balance * -1;
          }
        } else {
          if (transactionSelected.balance > this.totalPrice && this.totalPrice !== 0) {
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
        if (automatic && this.totalPrice < transBalance + this.balanceSelected) {
          if (this.totalPrice === 0) {
            movementOfCancellation.balance = this.roundNumber.transform(transBalance);
          } else {
            if (balanceSelected) {
              isValid = false;
              this._toastService.showToast({
                type: 'danger',
                message: 'La suma de saldo a cancelar no puede ser mayor al balance de la transacción.',
              });
            } else {
              movementOfCancellation.balance = this.roundNumber.transform(this.totalPrice - this.balanceSelected);
            }
          }
        } else {
          movementOfCancellation.balance = this.roundNumber.transform(transBalance);
        }
      } else {
        movementOfCancellation.balance = 0;
      }
      if (isValid) {
        for (const t of this.transactions) {
          if (t._id.toString() == transactionSelected._id.toString()) {
            t.balanceSelected = this.roundNumber.transform(movementOfCancellation.balance);
          }
        }
        this.movementsOfCancellations.push(movementOfCancellation);
        if (cancelForTotal) {
          const movementsOfCashes = await this.getMovementOfCashes({
            operationType: { $ne: 'D' },
            transaction: { $oid: transactionSelected._id },
            balanceCanceled: { $eq: 0 },
          });
          if (movementsOfCashes && movementsOfCashes.length > 0) {
            for (const mov of movementsOfCashes) {
              mov.balanceCanceled = mov.amountPaid;
            }
            this.assignMovementsOfCashes(movementsOfCashes);
          }
        }
      }
    }
    this.recalculateBalanceSelected();
  }

  async getMovementOfCashes(match: {}): Promise<MovementOfCash[]> {
    try {
      this.loading = true;
      let sortAux;
      if (this.orderTerm[0].charAt(0) === '-') {
        sortAux = `{ "${this.orderTerm[0].split('-')[1]}" : -1 }`;
      } else {
        sortAux = `{ "${this.orderTerm[0]}" : 1 }`;
      }
      sortAux = JSON.parse(sortAux);

      const result: ApiResponse = await firstValueFrom(
        this._movementOfCashService.getAll({
          project: {
            _id: 1,
            quota: 1,
            expirationDate: 1,
            'type._id': 1,
            'type.name': 1,
            amountPaid: 1,
            transaction: 1,
            operationType: 1,
            balanceCanceled: 1,
          },
          match,
          sort: sortAux,
        })
      );
      this.loading = false;
      return result?.result ?? [];
    } catch (error) {
      this.loading = false;
      throw error;
    }
  }

  recalculateBalanceSelected(): void {
    this.balanceSelected = 0;
    for (const mov of this.movementsOfCancellations) {
      if (!this.isMovementClosed(mov.transactionOrigin)) {
        this.balanceSelected += this.roundNumber.transform(mov.balance);
      }
    }
    this.roundNumber.transform(this.balanceSelected);
  }

  private isMovementClosed(transaction: Transaction): boolean {
    let closed: boolean = true;

    for (const trans of this.transactions) {
      if (trans._id.toString() === transaction._id.toString()) {
        closed = false;
      }
    }

    return closed;
  }

  modifyBalance(transaction: Transaction) {
    let modify: boolean = false;

    for (const canc of this.cancellationTypes) {
      if (canc.origin._id.toString() === transaction.type._id) {
        modify = canc.modifyBalance;
      }
    }

    return modify;
  }

  async selectAll(): Promise<void> {
    this.loading = true;
    try {
      for (const transaction of this.transactions) {
        if (this.isTransactionSelected(transaction)) {
          continue;
        }
        if (this.totalPrice > 0 && this.balanceSelected >= this.totalPrice) {
          break;
        }
        await this.selectTransaction(transaction, true);
      }
    } finally {
      this.loading = false;
    }
  }

  deleteAllMovements(): void {
    for (const trans of this.transactions) {
      this.deleteTransactionSelected(trans);
    }
    this.recalculateBalanceSelected();
  }

  public deleteTransactionSelected(transaction: Transaction): void {
    let movementToDelete: number | undefined;

    for (let i = 0; i < this.movementsOfCancellations.length; i++) {
      if (this.movementsOfCancellations[i].transactionOrigin._id.toString() === transaction._id.toString()) {
        movementToDelete = i;
      }
    }
    if (movementToDelete !== undefined) {
      this.movementsOfCancellations.splice(movementToDelete, 1);
    }
  }

  public isTransactionSelected(transaction: Transaction) {
    let isSelected: boolean = false;

    if (this.movementsOfCancellations && this.movementsOfCancellations.length > 0) {
      for (const mov of this.movementsOfCancellations) {
        if (mov.transactionOrigin._id.toString() === transaction._id.toString()) {
          isSelected = true;
        }
      }
    }

    return isSelected;
  }

  async finish() {
    try {
      this.loading = true;
      for (const mov of this.movementsOfCancellations) {
        if (
          this.roundNumber.transform(mov.balance) <= this.roundNumber.transform(mov.transactionOrigin.balance) ||
          !this.modifyBalance(mov.transactionOrigin)
        ) {
          for (const type of this.cancellationTypes) {
            if (type.origin._id === mov.transactionOrigin.type._id) {
              mov.type = type;
            }
          }
          if (
            mov.transactionOrigin.type &&
            mov.transactionOrigin.type.requestArticles &&
            mov.transactionDestination.type &&
            mov.transactionDestination.type.requestArticles
          ) {
            const movementsOfArticles: MovementOfArticle[] = await this.getMovementOfArticles(mov.transactionOrigin);
            for (const movementOfArticle of movementsOfArticles) {
              if (this.transactionDestination?.type?.groupsArticles) {
                let movement = this.existsMovementOfArticle(movementOfArticle);
                if (!movement) {
                  if (!this.movsOfArticles) this.movsOfArticles = [];
                  this.movsOfArticles.push(movementOfArticle);
                } else {
                  movement.amount += movementOfArticle.amount;
                  movement = this.recalculateMovArticle(movement, mov.transactionOrigin);
                }
              } else {
                if (mov && mov.type && mov.type.updatePrices) {
                  if (movementOfArticle.article && movementOfArticle.article.currency) {
                    const quotation = movementOfArticle.article.currency.quotation ?? 1;
                    movementOfArticle.salePrice = movementOfArticle.article.salePrice * quotation;
                    movementOfArticle.costPrice = movementOfArticle.article.costPrice * quotation;
                    movementOfArticle.unitPrice = movementOfArticle.article.salePrice * quotation;
                  } else {
                    movementOfArticle.salePrice = movementOfArticle.article.salePrice;
                    movementOfArticle.costPrice = movementOfArticle.article.costPrice;
                    movementOfArticle.unitPrice = movementOfArticle.article.salePrice;
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
            const result: ApiResponse = await firstValueFrom(
              this._movementOfCashService.getAll({
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
            );
            if (result.status !== 200) throw result;
            const movementsOfCashes: MovementOfCash[] = result.result;
            for (const movementOfCash of movementsOfCashes) {
              let movementOfArticle: MovementOfArticle | undefined;
              if (movementOfCash.commissionAmount > 0) {
                movementOfArticle = await this.createMovementOfArticleByArticleId(
                  movementOfCash.type.commissionArticle.toString(),
                  movementOfCash.commissionAmount,
                  this.transactionDestination,
                  ` POR ${movementOfCash.type.name} ${movementOfCash.number ? movementOfCash.number : ''}`,
                  movementOfCash.taxPercentage > 0 ? true : false
                );
              }

              if (movementOfCash.administrativeExpenseAmount > 0) {
                movementOfArticle = await this.createMovementOfArticleByArticleId(
                  movementOfCash.type.administrativeExpenseArticle.toString(),
                  movementOfCash.administrativeExpenseAmount,
                  this.transactionDestination,
                  ` POR ${movementOfCash.type.name} ${movementOfCash.number ? movementOfCash.number : ''}`,
                  movementOfCash.taxPercentage > 0 ? true : false
                );
              }

              if (movementOfCash.otherExpenseAmount > 0) {
                movementOfArticle = await this.createMovementOfArticleByArticleId(
                  movementOfCash.type.otherExpenseArticle.toString(),
                  movementOfCash.otherExpenseAmount,
                  this.transactionDestination,
                  ` POR ${movementOfCash.type.name} ${movementOfCash.number ? movementOfCash.number : ''}`,
                  movementOfCash.taxPercentage > 0 ? true : false
                );
              }
              if (movementOfArticle) this.movsOfArticles.push(movementOfArticle);
            }
          }
        } else {
          throw new Error(
            'El saldo ingresado en la transacción ' +
              mov.transactionOrigin.type.name +
              ' ' +
              mov.transactionOrigin.number +
              ' no puede ser mayor que el saldo restante de la misma.'
          );
        }
      }
      if (this.movsOfArticles && this.movsOfArticles.length !== 0) {
        await this.saveMovementsOfArticles(this.movsOfArticles);
      }

      if (!this.areValidMovements()) {
        this.loading = false;
        return;
      }

      if (this.movementsOfCancellations.length > 0) {
        await this.saveMovementsOfCancellations();
      }

      this.loading = false;
      this.activeModal.close({
        movementsOfCancellations: this.movementsOfCancellations,
        movementsOfCashes: this.movementsOfCashes,
      });
    } catch (error) {
      this.loading = false;
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
    const article = await this.getArticle(articleId);
    if (!article) {
      throw new Error('No se encontró el artículo para generar el movimiento');
    }

    const increasePrice = 0;

    const movementOfArticle = new MovementOfArticle();
    movementOfArticle.article = article;
    movementOfArticle.code = article.code;
    movementOfArticle.codeSAT = article.codeSAT;
    movementOfArticle.description = article.description + descriptionPlus;
    movementOfArticle.observation = article.observation;
    movementOfArticle.make = article.make;
    movementOfArticle.category = article.category;
    movementOfArticle.barcode = article.barcode;
    movementOfArticle.transaction = transaction as any;
    movementOfArticle.modifyStock = transaction.type.modifyStock;
    movementOfArticle.amount = 1;
    movementOfArticle.stockMovement = transaction.type.stockMovement;
    movementOfArticle.op = Date.now() + Math.floor(Math.random() * 100000);

    let quotation = 1;
    if (transaction.quotation) {
      quotation = transaction.quotation;
    }

    movementOfArticle.basePrice = this.roundNumber.transform(article.basePrice);

    if (article.currency && Config.currency && Config.currency._id !== article.currency._id) {
      movementOfArticle.basePrice = this.roundNumber.transform(movementOfArticle.basePrice * quotation);
    }

    if (transaction && transaction.type && transaction.type.transactionMovement === TransactionMovement.Sale) {
      movementOfArticle.costPrice = this.roundNumber.transform(article.costPrice);
      movementOfArticle.markupPercentage = article.markupPercentage;
      movementOfArticle.markupPrice = this.roundNumber.transform(article.markupPrice);
      if (salePrice) article.salePrice = salePrice;
      movementOfArticle.unitPrice = this.roundNumber.transform(article.salePrice / movementOfArticle.amount);
      movementOfArticle.salePrice = this.roundNumber.transform(article.salePrice);

      if (article.currency && Config.currency && Config.currency._id !== article.currency._id) {
        movementOfArticle.unitPrice = this.roundNumber.transform(movementOfArticle.salePrice * quotation);
        movementOfArticle.salePrice = this.roundNumber.transform(movementOfArticle.salePrice * quotation);
      }

      if (increasePrice != 0) {
        movementOfArticle.markupPrice = this.roundNumber.transform(
          movementOfArticle.markupPrice + (movementOfArticle.markupPrice * increasePrice) / 100
        );
        movementOfArticle.unitPrice = this.roundNumber.transform(
          movementOfArticle.unitPrice + (movementOfArticle.unitPrice * increasePrice) / 100
        );
        movementOfArticle.salePrice = this.roundNumber.transform(
          movementOfArticle.salePrice + (movementOfArticle.salePrice * increasePrice) / 100
        );
      }

      if (transaction.type.requestTaxes && calculaTax) {
        const taxes: Taxes[] = [];
        if (article.taxes) {
          for (const taxAux of article.taxes) {
            const tax: Taxes = {
              _id: taxAux._id,
              tax: taxAux.tax,
              percentage: this.roundNumber.transform(taxAux.percentage),
              taxAmount: this.roundNumber.transform(taxAux.taxAmount * movementOfArticle.amount),
              taxBase: this.roundNumber.transform(taxAux.taxBase * movementOfArticle.amount),
            };
            taxes.push(tax);
          }
        }
        movementOfArticle.taxes = taxes;
      }
    } else {
      movementOfArticle.markupPercentage = 0;
      movementOfArticle.markupPrice = 0;

      const taxedAmount = movementOfArticle.basePrice;
      movementOfArticle.costPrice = 0;

      if (transaction.type.requestTaxes && calculaTax) {
        const taxes: Taxes[] = [];
        if (article.taxes) {
          for (const taxAux of article.taxes) {
            taxAux.taxBase = this.roundNumber.transform(taxedAmount);
            if (taxAux.percentage !== 0) {
              taxAux.taxAmount = this.roundNumber.transform((taxAux.taxBase * taxAux.percentage) / 100);
            }
            taxes.push(taxAux);
            movementOfArticle.costPrice += taxAux.taxAmount;
          }
          movementOfArticle.taxes = taxes;
        }
      }
      movementOfArticle.costPrice += this.roundNumber.transform(taxedAmount);
      movementOfArticle.unitPrice = movementOfArticle.basePrice;
      movementOfArticle.salePrice = movementOfArticle.costPrice;
    }
    return movementOfArticle;
  }

  public async getArticle(articleId: string): Promise<Article | null> {
    try {
      const result: ApiResponse = await firstValueFrom(this._articleService.getById(articleId));
      if (result?.status === 200 && result.result) {
        return result.result;
      }
      if (result?.message) {
        this._toastService.showToast({
          type: 'info',
          message: result.message,
        });
      }
      return null;
    } catch (error) {
      this._toastService.showToast(error);
      return null;
    }
  }

  public existsMovementOfArticle(movementOfArticle: MovementOfArticle): MovementOfArticle | undefined {
    let movement: MovementOfArticle | undefined;
    if (this.movsOfArticles && this.movsOfArticles.length > 0) {
      for (const mov of this.movsOfArticles) {
        if (
          movementOfArticle.article &&
          mov.article &&
          mov.article._id === movementOfArticle.article._id &&
          mov.unitPrice === movementOfArticle.unitPrice
        ) {
          movement = mov;
        }
      }
    }
    return movement;
  }

  async getMovementOfArticles(transaction: Transaction): Promise<MovementOfArticle[]> {
    const result: ApiResponse = await firstValueFrom(
      this._movementOfArticleService.getAll({
        match: {
          transaction: { $oid: transaction._id },
          operationType: { $ne: 'D' },
        },
      })
    );

    if (result?.status && result.status !== 200) {
      throw result;
    }

    const movements: MovementOfArticle[] = [];
    for (const mov of result?.result ?? []) {
      const movementOfArticle = new MovementOfArticle();

      movementOfArticle.movementParent = mov.movementParent;
      movementOfArticle.code = mov.code;
      movementOfArticle.codeSAT = mov.codeSAT;
      movementOfArticle.description = mov.description;
      movementOfArticle.observation = mov.observation;
      if (mov.make && mov.make._id && mov.make._id !== '') {
        movementOfArticle.make = mov.make._id;
      } else {
        movementOfArticle.make = mov.make;
      }
      if (mov.category && mov.category._id && mov.category._id !== '') {
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
      movementOfArticle.transaction = { _id: this.transactionDestination._id } as Transaction as any;
      movementOfArticle.modifyStock = this.transactionDestination.type.modifyStock;
      movementOfArticle.stockMovement = this.transactionDestination.type.stockMovement;
      movementOfArticle.op = Date.now() + Math.floor(Math.random() * 100000);

      movementOfArticle.measure = mov.measure;
      movementOfArticle.quantityMeasure = mov.quantityMeasure;

      movementOfArticle.basePrice = mov.basePrice;

      if (this.transactionDestination.type.requestTaxes && !transaction.type.requestTaxes) {
        movementOfArticle.costPrice = mov.costPrice;
        movementOfArticle.salePrice = mov.salePrice;
        const taxes: Taxes[] = [];
        if (
          movementOfArticle.article &&
          movementOfArticle.article.taxes &&
          movementOfArticle.article.taxes.length > 0
        ) {
          for (const taxAux of movementOfArticle.article.taxes) {
            const tax: Taxes = {
              _id: taxAux._id,
              percentage: this.roundNumber.transform(taxAux.percentage),
              tax: taxAux.tax,
              taxBase: 0,
              taxAmount: 0,
            };
            if (tax.tax.taxBase == TaxBase.Neto) {
              tax.taxBase = this.roundNumber.transform(movementOfArticle.salePrice);
            }
            if (tax.percentage === 0) {
              tax.taxAmount = this.roundNumber.transform(tax.taxAmount * movementOfArticle.amount);
            } else {
              tax.taxAmount = this.roundNumber.transform((tax.taxBase * tax.percentage) / 100);
            }
            movementOfArticle.salePrice += tax.taxAmount;
            taxes.push(tax);
          }
        }
        movementOfArticle.taxes = taxes;

        movementOfArticle.unitPrice = movementOfArticle.salePrice / movementOfArticle.amount;
        movementOfArticle.markupPrice = this.roundNumber.transform(
          movementOfArticle.salePrice - movementOfArticle.costPrice
        );
        movementOfArticle.markupPercentage = this.roundNumber.transform(
          (movementOfArticle.markupPrice / movementOfArticle.costPrice) * 100,
          3
        );
        movementOfArticle.roundingAmount = mov.roundingAmount;
      } else {
        if (this.transactionDestination.type.requestTaxes && transaction.type.requestTaxes) {
          movementOfArticle.taxes = mov.taxes;
        }
        movementOfArticle.costPrice = mov.costPrice;
        movementOfArticle.unitPrice = mov.unitPrice;
        movementOfArticle.markupPercentage = mov.markupPercentage;
        movementOfArticle.markupPrice = mov.markupPrice;
        movementOfArticle.salePrice = mov.salePrice;
        movementOfArticle.roundingAmount = mov.roundingAmount;
      }
      if (this.transactionDestination.type.transactionMovement === TransactionMovement.Sale) {
        movements.push(this.recalculateSalePrice(movementOfArticle));
      } else {
        movements.push(this.recalculateCostPrice(movementOfArticle));
      }
    }
    return movements;
  }

  public recalculateMovArticle(mov: MovementOfArticle, transaction: Transaction): MovementOfArticle {
    let movementOfArticle = new MovementOfArticle();

    movementOfArticle.transaction = this.transactionDestination as any;
    movementOfArticle.article = mov.article;
    movementOfArticle.code = mov.code;
    movementOfArticle.codeSAT = mov.codeSAT;
    movementOfArticle.description = mov.description;
    movementOfArticle.observation = mov.observation;
    movementOfArticle.make = mov.make;
    movementOfArticle.category = mov.category;
    movementOfArticle.op = Date.now() + Math.floor(Math.random() * 100000);

    movementOfArticle.costPrice = mov.costPrice;
    movementOfArticle.salePrice = mov.salePrice;
    const taxes: Taxes[] = [];
    if (movementOfArticle.article && movementOfArticle.article.taxes && movementOfArticle.article.taxes.length > 0) {
      for (const taxAux of movementOfArticle.article.taxes) {
        const tax: Taxes = {
          _id: taxAux._id,
          percentage: this.roundNumber.transform(taxAux.percentage),
          tax: taxAux.tax,
          taxBase: 0,
          taxAmount: 0,
        };
        if (tax.tax.taxBase == TaxBase.Neto) {
          tax.taxBase = this.roundNumber.transform(movementOfArticle.salePrice);
        }
        if (tax.percentage === 0) {
          tax.taxAmount = this.roundNumber.transform(tax.taxAmount * movementOfArticle.amount);
        } else {
          tax.taxAmount = this.roundNumber.transform((tax.taxBase * tax.percentage) / 100);
        }
        movementOfArticle.salePrice += tax.taxAmount;
        taxes.push(tax);
      }
    }
    movementOfArticle.taxes = taxes;

    movementOfArticle.unitPrice = movementOfArticle.salePrice / movementOfArticle.amount;
    movementOfArticle.markupPrice = this.roundNumber.transform(
      movementOfArticle.salePrice - movementOfArticle.costPrice
    );
    movementOfArticle.markupPercentage = this.roundNumber.transform(
      (movementOfArticle.markupPrice / movementOfArticle.costPrice) * 100,
      3
    );
    movementOfArticle.roundingAmount = mov.roundingAmount;
    if (this.transactionDestination.type.requestTaxes && transaction.type.requestTaxes) {
      movementOfArticle.taxes = mov.taxes;
    } else {
      movementOfArticle.costPrice = mov.costPrice;
      movementOfArticle.unitPrice = mov.unitPrice;
      movementOfArticle.markupPercentage = mov.markupPercentage;
      movementOfArticle.markupPrice = mov.markupPrice;
      movementOfArticle.salePrice = mov.salePrice;
      movementOfArticle.roundingAmount = mov.roundingAmount;
    }
    if (this.transactionDestination.type.transactionMovement === TransactionMovement.Sale) {
      movementOfArticle = this.recalculateSalePrice(movementOfArticle);
    } else {
      movementOfArticle = this.recalculateCostPrice(movementOfArticle);
    }

    return movementOfArticle;
  }

  public recalculateCostPrice(movementOfArticle: MovementOfArticle): MovementOfArticle {
    let quotation = 1;

    if (this.transactionDestination.quotation) {
      quotation = movementOfArticle.transaction.quotation;
    }

    // ADVERTENCIA, EL UNIT PRICE NO SE RECALCULA CON EL DESCUENTO DE LA transaction PARA QUE EL DESCUENTO DE LA transaction CANCELADA PASE A LA transaction CANCELATORIA
    movementOfArticle.basePrice = this.roundNumber.transform(movementOfArticle.unitPrice * movementOfArticle.amount);
    movementOfArticle.markupPrice = 0.0;
    movementOfArticle.markupPercentage = 0.0;

    const taxedAmount = movementOfArticle.basePrice;
    movementOfArticle.costPrice = 0;

    if (this.transactionDestination.type.requestTaxes) {
      if (movementOfArticle.article && movementOfArticle.article.taxes && movementOfArticle.article.taxes.length > 0) {
        const taxes: Taxes[] = [];
        for (const articleTax of movementOfArticle.taxes) {
          if (articleTax.tax.taxBase === TaxBase.Neto) {
            articleTax.taxBase = taxedAmount;
          } else {
            articleTax.taxBase = 0;
          }
          if (articleTax.percentage === 0) {
            for (const artTax of movementOfArticle.article.taxes) {
              if (artTax.tax._id === articleTax.tax._id) {
                articleTax.taxAmount = this.roundNumber.transform(artTax.taxAmount * movementOfArticle.amount);
              }
            }
          } else {
            articleTax.taxAmount = this.roundNumber.transform((articleTax.taxBase * articleTax.percentage) / 100);
          }
          taxes.push(articleTax);
          movementOfArticle.costPrice += articleTax.taxAmount;
        }
        movementOfArticle.taxes = taxes;
      }
    }
    movementOfArticle.costPrice += this.roundNumber.transform(taxedAmount);
    movementOfArticle.salePrice = movementOfArticle.costPrice + movementOfArticle.roundingAmount;

    return movementOfArticle;
  }

  // EL IMPUESTO VA SOBRE EL ARTICULO Y NO SOBRE EL MOVIMIENTO
  public recalculateSalePrice(movementOfArticle: MovementOfArticle): MovementOfArticle {
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
        movementOfArticle.basePrice = this.roundNumber.transform(movementOfArticle.basePrice * quotation);
      }
    }

    if (movementOfArticle.article) {
      movementOfArticle.costPrice = this.roundNumber.transform(
        movementOfArticle.article.costPrice * movementOfArticle.amount
      );

      if (
        movementOfArticle.article.currency &&
        Config.currency &&
        Config.currency._id !== movementOfArticle.article.currency._id
      ) {
        movementOfArticle.costPrice = this.roundNumber.transform(movementOfArticle.costPrice * quotation);
      }
    }

    // ADVERTENCIA, EL UNIT PRICE NO SE RECALCULA CON EL DESCUENTO DE LA transaction PARA QUE EL DESCUENTO DE LA transaction CANCELADA PASE A LA transaction CANCELATORIA
    movementOfArticle.salePrice = this.roundNumber.transform(movementOfArticle.unitPrice * movementOfArticle.amount);
    movementOfArticle.markupPrice = this.roundNumber.transform(
      movementOfArticle.salePrice - movementOfArticle.costPrice
    );
    movementOfArticle.markupPercentage = this.roundNumber.transform(
      (movementOfArticle.markupPrice / movementOfArticle.costPrice) * 100,
      3
    );

    if (this.transactionDestination.type.requestTaxes) {
      const taxes: Taxes[] = [];
      if (movementOfArticle.article && movementOfArticle.article.taxes && movementOfArticle.article.taxes.length > 0) {
        let impInt: number = 0;
        for (const taxAux of movementOfArticle.article.taxes) {
          if (taxAux.percentage === 0) {
            impInt = this.roundNumber.transform(taxAux.taxAmount * movementOfArticle.amount);
          }
        }
        for (const taxAux of movementOfArticle.article.taxes) {
          const tax: Taxes = {
            _id: taxAux._id,
            percentage: this.roundNumber.transform(taxAux.percentage),
            tax: taxAux.tax,
            taxBase: 0,
            taxAmount: 0,
          };
          if (tax.percentage === 0) {
            tax.taxAmount = impInt;
            tax.taxBase = 0;
          } else {
            tax.taxBase = this.roundNumber.transform(
              (movementOfArticle.salePrice - impInt) / (tax.percentage / 100 + 1),
              4
            );
            tax.taxAmount = this.roundNumber.transform((tax.taxBase * tax.percentage) / 100, 4);
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

  public async saveMovementsOfCancellations(): Promise<void> {
    if (!this.movementsOfCancellations?.length || !this.transactionDestination) {
      return;
    }

    const destinationId = this.getEntityId(this.transactionDestination);
    const payload: any[] = this.movementsOfCancellations.map((movement) => ({
      transactionOrigin: { _id: this.getEntityId(movement.transactionOrigin) },
      transactionDestination: {
        _id: this.getEntityId(movement.transactionDestination) || destinationId,
      },
      type: movement.type ? { _id: this.getEntityId(movement.type) } : undefined,
      balance: movement.balance,
    }));

    const saved = await firstValueFrom(this._movementOfCancellationService.updateByDestination(destinationId, payload));
    const movements = saved?.result ?? saved?.movementsOfCancellations;
    if ((saved?.status && saved.status !== 200) || !movements) {
      this._toastService.showToast(saved);
      throw saved;
    }

    this.movementsOfCancellations = movements;
  }

  public areValidMovements(): boolean {
    let areValid: boolean = true;
    let totalBalance = 0;
    for (const mov of this.movementsOfCancellations) {
      if (!mov.saved) totalBalance += this.roundNumber.transform(mov.balance);
    }
    if (this.totalPrice !== 0 && this.totalPrice < this.roundNumber.transform(totalBalance)) {
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

  public updateBalanceOrigin(transaction: TransactionRow): void {
    if ((transaction.balanceSelected ?? 0) <= transaction.balance) {
      for (const mov of this.movementsOfCancellations) {
        if (mov.transactionOrigin._id.toString() === transaction._id.toString()) {
          mov.balance = this.roundNumber.transform(transaction.balanceSelected);
        }
      }
      this.recalculateBalanceSelected();
    } else {
      this._toastService.showToast({
        message: `El saldo ingresado no puede ser mayor al saldo de la transacción (${transaction.balance}).`,
        type: 'info',
      });
      transaction.balanceSelected = this.roundNumber.transform(transaction.balance);
    }
  }

  public async saveMovementsOfArticles(movementsOfArticles: MovementOfArticle[]): Promise<MovementOfArticle[]> {
    const result = await firstValueFrom(this._movementOfArticleService.saveMovementsOfArticles(movementsOfArticles));
    if (result.status === 200) {
      return result.result;
    }
    throw result;
  }

  private getEntityId(value: any): string | null {
    if (!value) return null;
    if (typeof value === 'string') return value;
    return value._id ?? null;
  }
}
