import { CommonModule } from '@angular/common';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TransactionService } from '@core/services/transaction.service';
import { NgbActiveModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { ToastService } from '@shared/components/toast/toast.service';
import { PipesModule } from '@shared/pipes/pipes.module';
import { ApiResponse } from '@types';
import { CancellationType } from 'app/components/cancellation-type/cancellation-type';
import { Transaction } from 'app/components/transaction/transaction';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
@Component({
  selector: 'app-cancelled-transactions',
  templateUrl: './canceled-transactions.component.html',
  standalone: true,
  imports: [CommonModule, NgbModule, TranslateModule, PipesModule, FormsModule],
})
export class CancelledTransactionsComponent implements OnInit, OnDestroy {
  @Input() cancellationTypes: CancellationType[];
  @Input() transaction: Transaction;
  public canceledTransactions: {
    typeId: string;
    code: number;
    origin: number;
    letter: string;
    number: number;
  } = {
    typeId: '',
    code: 0,
    origin: 0,
    letter: '',
    number: 0,
  };
  public loading;
  private destroy$ = new Subject<void>();

  constructor(
    public activeModal: NgbActiveModal,
    public _transactionService: TransactionService,
    public _toastService: ToastService
  ) {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnInit(): void {
    if (this.transaction?.canceledTransactions) {
      const canceled = this.transaction.canceledTransactions;
      this.canceledTransactions = {
        typeId: canceled.typeId || '',
        code: canceled.code || 0,
        origin: canceled.origin || 0,
        letter: canceled.letter || '',
        number: canceled.number || 0,
      };
    }
  }

  checkInformationCancellation() {
    if (this.canceledTransactions && this.canceledTransactions.typeId) {
      this.loading = true;

      let data = {
        project: {
          'type._id': 1,
          'type.codes': 1,
          origin: 1,
          number: 1,
          letter: 1,
          operationType: 1,
        },
        match: {
          'type._id': { $oid: this.canceledTransactions.typeId },
          origin: this.canceledTransactions.origin,
          letter: this.canceledTransactions.letter,
          number: this.canceledTransactions.number,
          operationType: { $ne: 'D' },
        },
      };

      this._transactionService
        .getAll(data)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (result: ApiResponse) => {
            if (result.status == 200) {
              if (!result.result.length) {
                this._toastService.showToast({ message: 'No se encontro ningún comprobante con esos datos.' });
              }
              let codeType = result.result[0].type.codes.find((cod) => cod.letter === this.canceledTransactions.letter);

              this.canceledTransactions.code = codeType.code;
              this._toastService.showToast(result);
              this.activeModal.close({ data: this.canceledTransactions });
            }
          },
          error: (error) => {
            this._toastService.showToast(error);
          },
          complete: () => {
            this.loading = false;
          },
        });
    } else {
      this._toastService.showToast({ message: 'Debe informar todos los campos del comprobante a informar' });
    }
  }

  cancel() {
    this.activeModal.close('cancel');
  }
}
