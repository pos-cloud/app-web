import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

import { User } from '@types';
import { TransactionMovement, TransactionType } from 'app/components/transaction-type/transaction-type';
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

  public sort: Record<string, number> = { startDate: -1 };
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

    const project = {
      _id: 1,
      startDate: 1,
      endDate: 1,
      number: 1,
      observation: 1,
      state: 1,
      madein: 1,
      operationType: 1,
      'type._id': 1,
      'type.name': 1,
      'type.transactionMovement': 1,
      'depositOrigin._id': 1,
      'depositOrigin.name': 1,
      'depositDestination._id': 1,
      'depositDestination.name': 1,
    };

    const match: any = {
      operationType: { $ne: 'D' },
      madein: 'mostrador',
      'type.transactionMovement': TransactionMovement.Production,
      state: { $in: ['Abierto', 'Pendiente'] },
    };
    if (this.filterType) match['type.name'] = { $regex: this.filterType, $options: 'i' };
    if (this.filterNumber) match['number'] = { $regex: this.filterNumber, $options: 'i' };
    if (this.filterDepositOrigin) match['depositOrigin.name'] = { $regex: this.filterDepositOrigin, $options: 'i' };
    if (this.filterDepositDestination)
      match['depositDestination.name'] = { $regex: this.filterDepositDestination, $options: 'i' };
    if (this.filterObservation) match['observation'] = { $regex: this.filterObservation, $options: 'i' };

    const group = { _id: null, count: { $sum: 1 }, items: { $push: '$$ROOT' } };
    const skip = (this.currentPage > 0 ? this.currentPage - 1 : 0) * this.itemsPerPage;

    this.subscription.add(
      this._transactionService
        .getAll({ project, match, sort: this.sort, group, limit: this.itemsPerPage, skip })
        .subscribe(
          (result) => {
            this.loading = false;
            if (result.status === 200) {
              this.transactions = result.result[0]?.items ?? [];
              this.totalItems = result.result[0]?.count ?? 0;
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
    this.sort[term] = this.sort[term] ? this.sort[term] * -1 : 1;
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
    const modalRef = this._modalService.open(ViewTransactionComponent, { size: 'lg', backdrop: 'static' });
    modalRef.componentInstance.transactionId = transaction._id;
  }
}
