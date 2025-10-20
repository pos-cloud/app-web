import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { TransactionService } from '@core/services/transaction.service';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { DeleteTransactionComponent } from '@shared/components/delete-transaction/delete-transaction.component';
import { ProgressbarModule } from '@shared/components/progressbar/progressbar.module';
import { ToastService } from '@shared/components/toast/toast.service';
import { PipesModule } from '@shared/pipes/pipes.module';
import { Transaction, TransactionMovement, TransactionState, User } from '@types';
import { ViewTransactionComponent } from 'app/components/transaction/view-transaction/view-transaction.component';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-subscription',
  templateUrl: './subscription.component.html',
  styleUrls: ['./subscription.component.scss'],
  standalone: true,
  imports: [CommonModule, TranslateModule, ProgressbarModule, PipesModule, NgbModule],
  encapsulation: ViewEncapsulation.None,
})
export class SubscriptionComponent implements OnInit {
  public loading: boolean = false;
  public transactions: Transaction[] = [];
  public selectedTransactions: Set<string> = new Set();
  public user: User | any;
  public itemsPerPage = 10;
  public currentPage: number = 1;
  private destroy$ = new Subject<void>();
  private subscription: Subscription = new Subscription();

  constructor(
    private _transactionService: TransactionService,
    private _authService: AuthService,
    private _router: Router,
    private _modalService: NgbModal,
    private _toastService: ToastService
  ) {}

  ngOnInit(): void {
    this._authService.getIdentity.subscribe((identity) => {
      if (identity) {
        this.user = identity;
      }
    });
    this.getTransactions();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.subscription.unsubscribe();
  }

  public getTransactions(): void {
    this.loading = true;

    let project = {
      _id: 1,
      startDate: 1,
      endDate: 1,
      origin: 1,
      number: 1,
      orderNumber: 1,
      observation: 1,
      totalPrice: 1,
      'type.isSubscription': 1,
      balance: 1,
      state: 1,
      madein: 1,
      operationType: 1,
      'type.name': 1,
      'type.transactionMovement': 1,
      'type.automaticCreation': 1,
      'type._id': 1,
      'company.name': 1,
      'company._id': 1,
    };

    let match = {
      state: TransactionState.Open,
      'type.isSubscription': true,
      operationType: { $ne: 'D' },
      'type.transactionMovement': TransactionMovement.Sale,
    };

    // Filtrar por usuario si tiene permisos de filtro
    if (this.user?.permission?.filterTransaction) {
      match['creationUser'] = { $oid: this.user._id };
    }

    // Filtrar por tipos de transacción si el usuario tiene permisos específicos
    if (
      this.user &&
      this.user.permission &&
      this.user.permission.transactionTypes &&
      this.user.permission.transactionTypes.length > 0
    ) {
      let transactionTypes = [];
      this.user.permission.transactionTypes.forEach((element) => {
        transactionTypes.push({ $oid: element });
      });
      match['type._id'] = { $in: transactionTypes };
    }

    let sort = { startDate: -1 };

    this.subscription.add(
      this._transactionService
        .getTransactionsV2(
          project, // PROJECT
          match, // MATCH
          sort, // SORT
          {}, // GROUP
          0, // LIMIT
          0 // SKIP
        )
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (result) => {
            if (result && result.transactions) {
              this.transactions = result.transactions;
            } else {
              this.transactions = [];
            }
          },
          error: (error) => {
            this._toastService.showToast(error);
            this.transactions = [];
          },
          complete: () => {
            this.loading = false;
          },
        })
    );
  }

  public generateSubscriptions(): void {
    this.loading = true;

    this.subscription.add(
      this._transactionService
        .generateSubscriptions()
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (result) => {
            this._toastService.showToast(result);
            if (result.status === 200) {
              this.getTransactions();
            }
          },
          error: (error) => {
            this._toastService.showToast(error);
            this.loading = false;
          },
          complete: () => {
            this.loading = false;
          },
        })
    );
  }

  public refresh(): void {
    this.getTransactions();
  }

  public openTransaction(transaction: Transaction): void {
    // Navegar a editar la transacción
    let route = '/pos/mostrador/editar-transaccion';

    let queryParams = {
      transactionId: transaction._id,
      returnURL: this.removeParam(this._router.url, 'automaticCreation'),
    };

    if (transaction.type.automaticCreation) {
      queryParams['automaticCreation'] = transaction.type._id;
    }
    this._router.navigate([route], {
      queryParams,
    });
  }

  private removeParam(sourceURL: string, key: string) {
    let rtn = sourceURL.split('?')[0],
      param,
      params_arr = [],
      queryString = sourceURL.indexOf('?') !== -1 ? sourceURL.split('?')[1] : '';

    if (queryString !== '') {
      params_arr = queryString.split('&');
      for (let i = params_arr.length - 1; i >= 0; i -= 1) {
        param = params_arr[i].split('=')[0];
        if (param === key) {
          params_arr.splice(i, 1);
        }
      }
      rtn = rtn + '?' + params_arr.join('&');
    }

    return rtn;
  }

  public toggleSelection(transactionId: string): void {
    if (this.selectedTransactions.has(transactionId)) {
      this.selectedTransactions.delete(transactionId);
    } else {
      this.selectedTransactions.add(transactionId);
    }
  }

  public isSelected(transactionId: string): boolean {
    return this.selectedTransactions.has(transactionId);
  }

  public selectAll(): void {
    this.transactions.forEach((transaction) => {
      this.selectedTransactions.add(transaction._id);
    });
  }

  public deselectAll(): void {
    this.selectedTransactions.clear();
  }

  public finishSelected(): void {
    if (this.selectedTransactions.size === 0) {
      this._toastService.showToast({
        type: 'info',
        message: 'No hay transacciones seleccionadas',
      });
      return;
    }

    // Aquí puedes implementar la lógica para finalizar las transacciones seleccionadas
    const selectedIds = Array.from(this.selectedTransactions);
    console.log('Finalizar transacciones:', selectedIds);

    // TODO: Implementar la llamada al servicio para finalizar
    this._toastService.showToast({
      type: 'info',
      message: `Se finalizarán ${selectedIds.length} transacciones`,
    });
  }

  public viewTransaction(transaction: Transaction): void {
    const modalRef = this._modalService.open(ViewTransactionComponent, {
      size: 'lg',
      backdrop: 'static',
    });
    modalRef.componentInstance.transactionId = transaction._id;
  }

  public deleteTransaction(transaction: Transaction): void {
    let modalRef = this._modalService.open(DeleteTransactionComponent, {
      size: 'lg',
      backdrop: 'static',
    });
    modalRef.componentInstance.transactionId = transaction._id;
    modalRef.result.then(
      (result) => {
        if (result === 'delete_close') {
          this.getTransactions();
        }
      },
      (reason) => {}
    );
  }
}
