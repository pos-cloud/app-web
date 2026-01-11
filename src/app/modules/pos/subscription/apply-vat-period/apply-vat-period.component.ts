import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TransactionService } from '@core/services/transaction.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastService } from '@shared/components/toast/toast.service';
import * as moment from 'moment';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-apply-vat-period',
  templateUrl: './apply-vat-period.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
})
export class ApplyVatPeriodComponent {
  public vatPeriodForm: FormGroup;
  public loading = false;
  private destroy$ = new Subject<void>();
  private subscription: Subscription = new Subscription();

  constructor(
    private fb: FormBuilder,
    public _transactionService: TransactionService,
    public activeModal: NgbActiveModal,
    private _toastService: ToastService
  ) {
    this.vatPeriodForm = this.fb.group({
      month: [moment().format('MM'), [Validators.required, Validators.pattern('^(0[1-9]|1[0-2])$')]],
      year: [moment().format('YYYY'), [Validators.required, Validators.pattern('^(20[2-9][0-9])$')]],
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  vatPeriod() {
    this.loading = true;
    const formData = `${this.vatPeriodForm?.value?.year}${this.vatPeriodForm?.value?.month}`;
    this.subscription.add(
      this._transactionService
        .generateSubscriptions(formData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (result) => {
            this._toastService.showToast(result);
          },
          error: (error) => {
            this._toastService.showToast(error);
            this.loading = false;
          },
          complete: () => {
            this.activeModal.close();
            this.loading = false;
          },
        })
    );
  }
}
