import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Title } from '@angular/platform-browser';
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
  selector: 'app-pos-stock',
  templateUrl: './stock.component.html',
  styleUrls: ['./stock.component.scss'],
  standalone: true,
  providers: [TranslateService],
  encapsulation: ViewEncapsulation.None,
  imports: [CommonModule, NgbModule, FormsModule, TranslateModule, PipesModule, ProgressbarModule],
})
export class StockComponent implements OnInit, OnDestroy {
  public readonly movement = TransactionMovement.Stock;

  public loading = false;
  public transactions: Transaction[] = [];
  public transactionTypes: TransactionType[] = [];

  public sortField = 'startDate';
  public sortOrder: 1 | -1 = -1;
  public currentPage = 1;
  public itemsPerPage = 10;
  public totalItems = 0;

  public filterType = '';
  public filterNumber = '';
  public filterDepositOrigin = '';
  public filterDepositDestination = '';
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
    private _router: Router,
    private _title: Title
  ) {}

  async ngOnInit(): Promise<void> {
    this._title.setTitle('Stock');
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
      this._transactionService
        .getPendingStock({
          page: this.currentPage,
          limit: Number(this.itemsPerPage),
          sort: this.sortField,
          order: this.sortOrder,
          type: this.filterType,
          number: this.filterNumber,
          depositOrigin: this.filterDepositOrigin,
          depositDestination: this.filterDepositDestination,
          observation: this.filterObservation,
        })
        .subscribe(
          (result) => {
            this.loading = false;
            const page = result?.result;
            if (Array.isArray(page?.items)) {
              this.transactions = page.items;
              this.totalItems = page.total ?? 0;
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

  public refresh(): void {
    this.getTransactions();
  }

  public orderBy(term: string): void {
    if (this.sortField === term) {
      this.sortOrder = this.sortOrder === 1 ? -1 : 1;
    } else {
      this.sortField = term;
      this.sortOrder = 1;
    }
    this.getTransactions();
  }

  public addFilters(): void {
    this.currentPage = 1;
    this.getTransactions();
  }

  public pageChange(page: number): void {
    this.currentPage = page;
    this.getTransactions();
  }

  private async loadTransactionTypes(): Promise<void> {
    this.transactionTypes =
      (await this._createTransactionService.getTransactionTypesByMovement(this.movement, this.user)) ?? [];
  }

  public async onNew(type: TransactionType): Promise<void> {
    const result = await this._createTransactionService.create(type, this.buildContext());
    if (result.status === 'redirect') {
      this.openView(result.transaction);
      return;
    }
    this.refresh();
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
    // this._router.navigate(['/transaction/view/stock', transaction._id], {
    //   queryParams: { returnURL: this._router.url },
    // });
  }

  public preview(transaction: Transaction, event: Event): void {
    event.stopPropagation();
    const modalRef = this._modalService.open(ViewTransactionComponent, { size: 'lg', backdrop: 'static' });
    modalRef.componentInstance.transactionId = transaction._id;
  }
}
