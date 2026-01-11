import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '@core/services/auth.service';
import { DatatableService } from '@core/services/datatable.service';
import { TransactionService } from '@core/services/transaction.service';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { ProgressbarModule } from '@shared/components/progressbar/progressbar.module';
import { ToastService } from '@shared/components/toast/toast.service';
import { DateFormatPipe } from '@shared/pipes/date-format.pipe';
import { PipesModule } from '@shared/pipes/pipes.module';
import { RoundNumberPipe } from '@shared/pipes/round-number.pipe';
import { ApiResponse, Transaction, TransactionState, User } from '@types';
import { DatatableModule } from 'app/components/datatable/datatable.module';
import { ViewTransactionComponent } from 'app/components/transaction/view-transaction/view-transaction.component';
import { DeleteTransactionComponent } from 'app/modules/transaction/components/delete-transaction/delete-transaction.component';

import { Subject, Subscription, takeUntil } from 'rxjs';
import { ApplyVatPeriodComponent } from './apply-vat-period/apply-vat-period.component';
import { attributes } from './attributes-subscription';

@Component({
  selector: 'app-subscription',
  templateUrl: './subscription.component.html',
  styleUrls: ['./subscription.component.scss'],
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [CommonModule, NgbModule, DatatableModule, PipesModule, TranslateModule, FormsModule, ProgressbarModule],
})
export class SubscriptionComponent implements OnInit {
  public loading: boolean = false;
  private roundNumberPipe: RoundNumberPipe = new RoundNumberPipe();
  public datePipe = new DateFormatPipe();
  private currencyPipe: CurrencyPipe = new CurrencyPipe('es-Ar');
  private subscription: Subscription = new Subscription();
  public _datatableService: DatatableService;
  public loadingAfip: boolean = false;
  public transactions: Transaction[] = [];
  public transaction;
  public columns = attributes;
  public sort = { endDate: -1 };
  public totalItems: number = 0;
  public filters: any;
  public processingProgress: { current: number; total: number } | null = null;
  public isProcessing: boolean = false;

  public selectedTransactions: Set<string> = new Set();
  public user: User | any;
  public itemsPerPage = 999999999;

  public currentPage: number = 1;
  private destroy$ = new Subject<void>();

  constructor(
    private _transactionService: TransactionService,
    private _authService: AuthService,
    private _modalService: NgbModal,
    private _toastService: ToastService
  ) {}

  ngOnInit(): void {
    this._authService.getIdentity.subscribe((identity) => {
      if (identity) {
        this.user = identity;
      }
    });
    this._datatableService = new DatatableService(this._transactionService, this.columns);

    this.processParams();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.subscription.unsubscribe();
  }

  public async getItems() {
    this.loading = true;

    this.subscription.add(
      await this._datatableService
        .getItems(this.filters, this.currentPage, this.itemsPerPage, this.sort)
        .then((result) => {
          if (result.status === 200) {
            if (result.result.length > 0) {
              if (this.itemsPerPage === 0) {
                this.itemsPerPage = 10;
              } else {
                this.transactions = result.result[0].items;
                this.totalItems = result.result[0].count;
              }
            } else {
              this.transactions = [];
              this.totalItems = 0;
            }
          } else this._toastService.showToast(result);
        })
        .catch((error) => this._toastService.showToast(error))
    );
    this.loading = false;
  }

  public generateSubscriptions(): void {
    let modalRef;
    modalRef = this._modalService.open(ApplyVatPeriodComponent, {
      size: 'lg',
      backdrop: 'static',
    });

    modalRef.result.then(() => {
      this.refresh();
      this.loading = false;
    });
  }

  async updateTransaction(): Promise<Transaction> {
    return new Promise<Transaction>((resolve, reject) => {
      this._transactionService
        .update(this.transaction)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (result: ApiResponse) => {
            if (result.status !== 200) {
              reject(result);
            }
            resolve(result.result);
          },
          error: (error) => {
            reject(error);
          },
          complete: () => {
            this.loading = false;
          },
        });
    });
  }

  public refresh(): void {
    this.getItems();
  }

  public orderBy(term: string): void {
    if (this.sort[term]) {
      this.sort[term] *= -1;
    } else {
      this.sort = JSON.parse('{"' + term + '": 1 }');
    }

    this.getItems();
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
            '1.2-2'
          );
          break;
        case 'percent':
          value = this.roundNumberPipe.transform(eval(val)) + '%';
          break;
        case 'date':
          value = eval(val);
          break;
        default:
          value = eval(val);
          break;
      }
    }

    return value;
  }

  private processParams(): void {
    this.filters = {};

    for (let field of this.columns) {
      this.filters[field.name] = field.defaultFilter;
    }
    this.itemsPerPage = 99999999;
    this.getItems();
  }

  public addFilters(): void {
    this.getItems();
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

  public async finishSelected() {
    if (this.selectedTransactions.size === 0) {
      this._toastService.showToast({
        type: 'info',
        message: 'No hay transacciones seleccionadas',
      });
      return;
    }

    if (this.isProcessing) {
      this._toastService.showToast({
        type: 'info',
        message: 'Ya hay un proceso en ejecución',
      });
      return;
    }

    this.isProcessing = true;
    const transactionsIds = Array.from(this.selectedTransactions);
    const total = transactionsIds.length;
    let processed = 0;
    let hasError = false;

    this.processingProgress = { current: 0, total };

    try {
      for (let i = 0; i < transactionsIds.length; i++) {
        if (hasError) {
          break;
        }

        const transactionId = transactionsIds[i];
        this.transaction = this.transactions.find((data) => data._id === transactionId);

        if (!this.transaction) {
          continue;
        }

        this.processingProgress = { current: i + 1, total };

        if (this.transaction?.type?.electronics) {
          try {
            const result = await this.validateElectronicTransactionAR();
            if (!result.success) {
              hasError = true;
              // El error ya se mostró en validateElectronicTransactionAR, solo indicamos que se detuvo
              this._toastService.showToast({
                type: 'warning',
                message: `El proceso se ha detenido debido a un error en la validación electrónica.`,
              });
              break;
            }
          } catch (error) {
            hasError = true;
            this._toastService.showToast({
              type: 'danger',
              message: `Error al validar transacción ${
                this.transaction.number || transactionId
              }. El proceso se ha detenido.`,
            });
            break;
          }
        } else {
          try {
            this.transaction.state = TransactionState.Closed;

            await this.updateTransaction();
          } catch (error) {
            hasError = true;
            this._toastService.showToast({
              type: 'danger',
              message: `Error al actualizar transacción ${
                this.transaction.number || transactionId
              }. El proceso se ha detenido.`,
            });
            break;
          }
        }

        processed++;

        // Permitir que la UI se actualice entre iteraciones
        await new Promise((resolve) => setTimeout(resolve, 0));
      }

      if (!hasError) {
        this._toastService.showToast({
          type: 'success',
          message: `Se procesaron exitosamente ${processed} de ${total} transacciones`,
        });
      }

      // Remover las transacciones procesadas exitosamente del set
      if (processed > 0) {
        const processedIds = transactionsIds.slice(0, processed);
        processedIds.forEach((id) => this.selectedTransactions.delete(id));
      }

      this.refresh();
    } catch (error) {
      this._toastService.showToast({
        type: 'danger',
        message: 'Error inesperado durante el procesamiento',
      });
    } finally {
      this.isProcessing = false;
      this.processingProgress = null;
      this.loading = false;
      this.loadingAfip = false;
    }
  }

  async validateElectronicTransactionAR(): Promise<{ success: boolean; error?: any }> {
    return new Promise((resolve) => {
      this.loadingAfip = true;
      this._transactionService
        .validateElectronicTransactionAR(this.transaction, null)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: async (result: ApiResponse) => {
            if (result.status === 200) {
              const transactionResponse: Transaction = result.result;
              this.transaction.CAE = transactionResponse.CAE;
              this.transaction.CAEExpirationDate = transactionResponse.CAEExpirationDate;
              this.transaction.number = transactionResponse.number;
              this.transaction.state = transactionResponse.state;

              resolve({ success: true });
            } else {
              // Mostrar el toast como en el código original cuando el status no es 200
              this._toastService.showToast(result);
              resolve({ success: false, error: result });
            }
            this.loadingAfip = false;
          },
          error: (error) => {
            this.loadingAfip = false;
            this._toastService.showToast(error);
            resolve({ success: false, error });
          },
          complete: () => {
            this.loading = false;
            this.loadingAfip = false;
          },
        });
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
          this.getItems();
        }
      },
      (reason) => {}
    );
  }
}
