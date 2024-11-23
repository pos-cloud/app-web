import { Component, Input, OnDestroy, OnInit } from '@angular/core';

import { NgbActiveModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Subject } from 'rxjs';

import { CommonModule } from '@angular/common';
import { Transaction } from 'app/components/transaction/transaction';
import { User } from 'app/components/user/user';
import { AuthService } from 'app/core/services/auth.service';
import { TransactionService } from 'app/core/services/transaction.service';
import { ToastService } from 'app/shared/components/toast/toast.service';
@Component({
  selector: 'app-delete-transaction',
  templateUrl: './delete-transaction.component.html',
  standalone: true,
  imports: [CommonModule, NgbModule],
})
export class DeleteTransactionComponent implements OnInit, OnDestroy {
  @Input() transactionId: string;
  public transaction: Transaction;
  public loading: boolean = false;

  private user: User;
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  constructor(
    public activeModal: NgbActiveModal,
    private _transactionService: TransactionService,
    private _toast: ToastService,
    private _authService: AuthService
  ) {}

  /**
   * On init
   */
  public ngOnInit(): void {
    this._authService.getIdentity.subscribe((identity) => {
      if (identity) {
        this.user = identity;
      }
    });

    if (this.transactionId) {
      this.getTransaction();
    }
  }

  /**
   * On destroy
   */
  ngOnDestroy(): void {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  public getTransaction(): void {
    this.loading = true;

    this._transactionService.getTransaction(this.transactionId).subscribe(
      (result) => {
        if (!result.transaction) {
          this._toast.showToast(null, 'info', result.message);
        } else {
          this.transaction = result.transaction;
        }
        this.loading = false;
      },
      (error) => this._toast.showToast(error)
    );
  }

  public deleteTransaction(): void {
    this.loading = true;

    if (!this.canDeleteTransaction()) {
      this._toast.showToast({
        message: 'No tiene permisos para eliminar una transacción.',
      });
      this.loading = false;
      return;
    }

    if (
      !this.transaction.CAE &&
      !this.transaction.SATStamp &&
      !this.transaction.stringSAT &&
      !this.transaction.CFDStamp
    ) {
      this._transactionService.delete(this.transaction._id).subscribe(
        (result) => {
          this._toast.showToast(result);
          if (result.status === 200) this.activeModal.close('delete_close');
          this.loading = false;
        },
        (error) => {
          this._toast.showToast(error);
          this.loading = false;
        }
      );
    } else {
      this._toast.showToast({
        message:
          'No se puede eliminar una transacción electrónica ya validada.',
      });
      this.loading = false;
    }
  }

  private canDeleteTransaction(): boolean {
    const transactionCollection = this.user?.permission?.collections.find(
      (collection) => collection.name === 'transacciones'
    );
    return transactionCollection?.actions?.delete !== false;
  }
}
