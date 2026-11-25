import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';
import { Subscription } from 'rxjs';

import { Movements, TransactionMovement, TransactionState, TransactionType, User } from '@types';
import { AddMovementOfCashComponent } from 'app/components/movement-of-cash/add-movement-of-cash/add-movement-of-cash.component';
import { AddTransactionComponent } from 'app/components/transaction/add-transaction/add-transaction.component';
import { Transaction } from 'app/components/transaction/transaction';
import { AuthService } from 'app/core/services/auth.service';
import { ConfigService } from 'app/core/services/config.service';
import { TransactionService } from 'app/core/services/transaction.service';
import { DeleteTransactionComponent } from 'app/modules/transaction/components/delete-transaction/delete-transaction.component';
import { ViewTransactionComponent } from 'app/modules/transaction/components/view-transaction/view-transaction.component';
import { CreateTransactionService, PosContext } from 'app/modules/transaction/services/create-transaction.service';
import { AddCashBoxComponent } from 'app/modules/transaction/views/cash-box/add-cash-box.component';
import { TransferCashBoxComponent } from 'app/modules/transaction/views/cash-box/components/transfer-cash-box/transfer-cash-box.component';
import { ProgressbarModule } from 'app/shared/components/progressbar/progressbar.module';
import { ToastService } from 'app/shared/components/toast/toast.service';
import { PipesModule } from 'app/shared/pipes/pipes.module';

@Component({
  selector: 'app-pos-money',
  templateUrl: './money.component.html',
  styleUrls: ['./money.component.scss'],
  standalone: true,
  providers: [TranslateService],
  encapsulation: ViewEncapsulation.None,
  imports: [CommonModule, NgbModule, FormsModule, TranslateModule, PipesModule, ProgressbarModule],
})
export class MoneyComponent implements OnInit, OnDestroy {
  public readonly movement = TransactionMovement.Money;

  public loading = false;
  public transactions: Transaction[] = [];
  public transactionTypes: TransactionType[] = [];
  private allTransactions: Transaction[] = [];

  public sort: Record<string, number> = { startDate: -1 };
  public currentPage = 1;
  public itemsPerPage = 10;
  public totalItems = 0;

  public filterType = '';
  public filterNumber = '';
  public filterObservation = '';

  private user: User;
  private config: any;
  private subscription = new Subscription();

  constructor(
    private _transactionService: TransactionService,
    private _createTransactionService: CreateTransactionService,
    private _authService: AuthService,
    private _configService: ConfigService,
    private _modalService: NgbModal,
    private _toastService: ToastService,
    private _router: Router
  ) {}

  async ngOnInit(): Promise<void> {
    this.subscription.add(this._authService.getIdentity.subscribe((identity) => (this.user = identity)));
    this.subscription.add(this._configService.getConfig.subscribe((config) => (this.config = config)));
    await this.loadTransactionTypes();
    this.getTransactions();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  public getTransactions(): void {
    this.loading = true;

    this.subscription.add(
      this._transactionService.getPendingMoney().subscribe(
        (result) => {
          this.loading = false;
          if (Array.isArray(result?.result)) {
            this.allTransactions = result.result;
            this.applyList();
          } else {
            this._toastService.showToast(result);
          }
        },
        (error) => {
          this.loading = false;
          this._toastService.showToast(error);
        }
      )
    );
  }

  public applyList(): void {
    const type = this.filterType.trim().toLowerCase();
    const number = this.filterNumber.trim().toLowerCase();
    const observation = this.filterObservation.trim().toLowerCase();

    const rows = this.allTransactions.filter((transaction) => {
      if (type && !(transaction.type?.name ?? '').toLowerCase().includes(type)) return false;
      if (
        number &&
        !String(transaction.number ?? '')
          .toLowerCase()
          .includes(number)
      )
        return false;
      if (observation && !(transaction.observation ?? '').toLowerCase().includes(observation)) return false;
      return true;
    });

    rows.sort((a, b) => {
      for (const term of Object.keys(this.sort)) {
        const order = this.sort[term];
        const left = this.sortValue(a, term);
        const right = this.sortValue(b, term);
        if (left < right) return -order;
        if (left > right) return order;
      }
      return 0;
    });

    this.totalItems = rows.length;
    const pageSize = Number(this.itemsPerPage) || 10;
    let start = (this.currentPage > 0 ? this.currentPage - 1 : 0) * pageSize;
    if (start >= rows.length && this.currentPage > 1) {
      this.currentPage = 1;
      start = 0;
    }
    this.transactions = rows.slice(start, start + pageSize);
  }

  private sortValue(transaction: Transaction, term: string): string | number {
    if (term === 'type.name') return (transaction.type?.name ?? '').toLowerCase();
    if (term === 'number') return Number(transaction.number) || 0;
    if (term === 'totalPrice') return Number(transaction.totalPrice) || 0;
    if (term === 'startDate') return transaction.startDate ? new Date(transaction.startDate).getTime() : 0;
    const value = (transaction as unknown as Record<string, unknown>)[term];
    return typeof value === 'string' ? value.toLowerCase() : ((value as number) ?? '');
  }

  public refresh(): void {
    this.getTransactions();
  }

  public orderBy(term: string): void {
    this.sort[term] = this.sort[term] ? this.sort[term] * -1 : 1;
    this.applyList();
  }

  public addFilters(): void {
    this.currentPage = 1;
    this.applyList();
  }

  public pageChange(page: number): void {
    this.currentPage = page;
    this.applyList();
  }

  public onPageSizeChange(): void {
    this.itemsPerPage = Number(this.itemsPerPage) || 10;
    this.currentPage = 1;
    this.applyList();
  }

  private async loadTransactionTypes(): Promise<void> {
    this.transactionTypes =
      (await this._createTransactionService.getTransactionTypesByMovement(this.movement, this.user)) ?? [];
  }

  public async onNew(type: TransactionType): Promise<void> {
    if (this.isCashBoxType(type)) {
      this.openCashBox(type);
      return;
    }

    if (this.isCashTransferType(type)) {
      this.openCashTransfer(type);
      return;
    }

    const result = await this._createTransactionService.create(type, this.buildContext());

    if (result.status !== 'redirect') {
      if (result.status !== 'cancelled') {
        this.refresh();
      }
      return;
    }

    if (type?.abbreviation === 'EGR' || type?.abbreviation === 'ING') {
      this.openIncomeOrExpense(result.transaction);
      return;
    }

    this._router.navigate(result.commands, { queryParams: result.queryParams });
  }

  private isCashBoxType(type: TransactionType): boolean {
    return !!type?.cashOpening || !!type?.cashClosing || type?.abbreviation === 'A.C' || type?.abbreviation === 'C.C';
  }

  private isCashTransferType(type: TransactionType): boolean {
    return (
      type?.abbreviation === 'T.C' ||
      (type?.movement === Movements.Transfer && type?.transactionMovement === TransactionMovement.Money)
    );
  }

  private openCashBox(type: TransactionType): void {
    const modalRef = this._modalService.open(AddCashBoxComponent, {
      size: 'lg',
      backdrop: 'static',
      windowClass: 'cash-box-modal-pending',
      backdropClass: 'cash-box-modal-pending',
    });
    modalRef.componentInstance.transactionType = type;
    modalRef.result.then(
      () => this.refresh(),
      () => this.refresh()
    );
  }

  private openCashTransfer(type: TransactionType): void {
    const modalRef = this._modalService.open(TransferCashBoxComponent, {
      size: 'lg',
      backdrop: 'static',
      windowClass: 'cash-box-modal-pending',
      backdropClass: 'cash-box-modal-pending',
    });
    modalRef.componentInstance.transactionType = type;
    modalRef.result.then(
      () => this.refresh(),
      () => this.refresh()
    );
  }

  private openIncomeOrExpense(transaction: Transaction): void {
    const modalRef = this._modalService.open(AddTransactionComponent, {
      size: 'lg',
      backdrop: 'static',
    });
    modalRef.componentInstance.transactionId = transaction._id;
    modalRef.result.then(
      (modalResult) => {
        const saved: Transaction = modalResult?.transaction;
        if (!saved) {
          this.refresh();
          return;
        }
        if (saved.type?.requestArticles) {
          this._router.navigate(['/pos/mostrador/editar-transaccion'], {
            queryParams: { transactionId: saved._id, returnURL: this._router.url },
          });
          return;
        }
        if (saved.type?.requestPaymentMethods) {
          this.openCharge(saved);
          return;
        }
        this.closeTransaction(saved);
      },
      () => this.refresh()
    );
  }

  private openCharge(transaction: Transaction): void {
    const modalRef = this._modalService.open(AddMovementOfCashComponent, {
      size: 'lg',
      backdrop: 'static',
    });
    modalRef.componentInstance.transaction = transaction;
    modalRef.result.then(
      async (chargeResult) => {
        if (!chargeResult?.movementsOfCashes) {
          this.refresh();
          return;
        }
        transaction.commissionAmount = 0;
        for (const movement of chargeResult.movementsOfCashes) {
          transaction.commissionAmount += movement.commissionAmount || 0;
        }
        const updated = await this.updateTransaction(transaction);
        if (!updated) {
          this.refresh();
          return;
        }
        await this.closeTransaction(updated);
      },
      () => this.refresh()
    );
  }

  private async closeTransaction(transaction: Transaction): Promise<void> {
    const balance = await this._transactionService.updateBalance(transaction).toPromise();
    if (balance?.status !== 200) {
      this._toastService.showToast(balance);
      this.refresh();
      return;
    }
    transaction.balance = balance.result.balance;
    if (!transaction.endDate) {
      transaction.endDate = moment().format('YYYY-MM-DDTHH:mm:ssZ');
    }
    transaction.VATPeriod = moment(transaction.endDate, 'YYYY-MM-DDTHH:mm:ssZ').format('YYYYMM');
    transaction.expirationDate = transaction.endDate;
    transaction.state = TransactionState.Closed;
    await this.updateTransaction(transaction);
    this.refresh();
  }

  private updateTransaction(transaction: Transaction): Promise<Transaction | null> {
    return new Promise((resolve) => {
      this._transactionService.update(transaction).subscribe(
        (result) => {
          if (result?.status === 200) {
            resolve(result.result);
            return;
          }
          this._toastService.showToast(result);
          resolve(null);
        },
        (error) => {
          this._toastService.showToast(error);
          resolve(null);
        }
      );
    });
  }

  private buildContext(): PosContext {
    return {
      posType: 'mostrador',
      transactionMovement: this.movement,
      user: this.user,
      config: this.config,
      returnURL: this._router.url,
    };
  }

  public openView(transaction: Transaction): void {
    const modalRef = this._modalService.open(ViewTransactionComponent, { size: 'lg', backdrop: 'static' });
    modalRef.componentInstance.transactionId = transaction._id;
  }

  public deleteTransaction(transaction: Transaction): void {
    const modalRef = this._modalService.open(DeleteTransactionComponent, { size: 'lg', backdrop: 'static' });
    modalRef.componentInstance.transactionId = transaction._id;
    modalRef.result.then(
      (result) => {
        if (result === 'delete_close') this.refresh();
      },
      () => {}
    );
  }
}
