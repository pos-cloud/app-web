import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

import { User } from '@types';
import { TransactionMovement, TransactionType } from '@types';
import { Transaction } from 'app/components/transaction/transaction';
import { AuthService } from 'app/core/services/auth.service';
import { ConfigService } from 'app/core/services/config.service';
import { TransactionService } from 'app/core/services/transaction.service';
import { ViewTransactionComponent } from 'app/modules/transaction/components/view-transaction/view-transaction.component';
import { CreateTransactionService, PosContext } from 'app/modules/transaction/services/create-transaction.service';
import { ProgressbarModule } from 'app/shared/components/progressbar/progressbar.module';
import { ToastService } from 'app/shared/components/toast/toast.service';
import { PipesModule } from 'app/shared/pipes/pipes.module';

@Component({
  selector: 'app-pos-production',
  templateUrl: './production.component.html',
  styleUrls: ['./production.component.scss'],
  standalone: true,
  providers: [TranslateService],
  encapsulation: ViewEncapsulation.None,
  imports: [CommonModule, NgbModule, FormsModule, TranslateModule, PipesModule, ProgressbarModule],
})
export class ProductionComponent implements OnInit, OnDestroy {
  public readonly movement = TransactionMovement.Production;

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
      this._transactionService.getPendingProduction().subscribe(
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
      if (number && !String(transaction.number ?? '').toLowerCase().includes(number)) return false;
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
    const result = await this._createTransactionService.create(type, this.buildContext());
    if (result.status === 'redirect') {
      this._router.navigate(result.commands, { queryParams: result.queryParams });
    } else {
      this.refresh();
    }
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
    this._router.navigate(['/pos/mostrador/editar-transaccion'], {
      queryParams: { transactionId: transaction._id, returnURL: this._router.url },
    });
  }

  public preview(transaction: Transaction, event: Event): void {
    event.stopPropagation();
    const modalRef = this._modalService.open(ViewTransactionComponent, { size: 'lg', backdrop: 'static' });
    modalRef.componentInstance.transactionId = transaction._id;
  }
}
